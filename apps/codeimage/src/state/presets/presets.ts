import {provideAppState} from '@codeimage/store/index';
import {withEntityPlugin} from '@codeimage/store/plugins/withEntityPlugin';
import {withIndexedDbPlugin} from '@codeimage/store/plugins/withIndexedDbPlugin';
import {toast} from '@codeimage/ui';
import {createEffect, on, untrack} from 'solid-js';
import {withAsyncAction} from 'statebuilder/asyncAction';
import * as api from '../../data-access/preset';
import {useIdb} from '../../hooks/use-indexed-db';
import {getAuth0State} from '../auth/auth0';
import {experimental__defineResource} from '../plugins/bindStateBuilderResource';
import {withPresetBridge} from './bridge';
import {Preset, PresetsArray} from './types';

const idbKey = 'presets';
const idb = useIdb();

function mergeDbPresetsWithLocalPresets(
  presets: Preset[],
  localPresets: Preset[],
) {
  return [
    ...localPresets.filter(
      localPreset =>
        !presets.find(preset => preset.data.localSyncId === localPreset.id),
    ),
    ...presets,
  ];
}

async function fetchInitialState() {
  const useInMemoryStore = !getAuth0State().loggedIn();
  const localPresets = await idb
    .get<PresetsArray>(idbKey)
    .then(data => data ?? ([] as PresetsArray))
    .catch(() => [] as PresetsArray);

  return (
    useInMemoryStore
      ? Promise.resolve(localPresets)
      : api
          .getAllPresets({})
          .then(presets =>
            mergeDbPresetsWithLocalPresets(presets, localPresets),
          )
  ).catch(() => [] as PresetsArray);
}

const PresetStoreDefinition = experimental__defineResource(fetchInitialState)
  .extend(withEntityPlugin<PresetsArray>())
  .extend(withIndexedDbPlugin<PresetsArray>(idbKey, []))
  .extend(withPresetBridge(idbKey))
  .extend(withAsyncAction())
  .extend(store => {
    const sharePresetKey = 'share_preset';
    createEffect(
      on(
        () => store.state === 'ready',
        isReady => {
          if (isReady) {
            const params = new URLSearchParams(window.location.search);
            if (params.has(sharePresetKey)) {
              const sharePreset = params.get(sharePresetKey) as string;
              try {
                const preset = JSON.parse(window.atob(sharePreset));
                store.bridge
                  .addNewPreset(preset.name, preset.data)
                  .then(preset => store.set(_ => [preset, ...(_ ?? [])]))
                  .then(() => {
                    const url =
                      window.location.origin + window.location.pathname;
                    window.history.replaceState(undefined, '', url);
                  })
                  .then(() =>
                    toast.success('Preset imported successfully', {
                      position: 'bottom-center',
                    }),
                  );
              } catch (e) {
                toast.error('Invalid preset', {
                  position: 'bottom-center',
                });
              }
            }
          }
        },
      ),
    );
  })
  .extend(store => {
    return {
      sortedPresets() {
        if (store.loading) return [];
        return store().sort((a, b) =>
          store.bridge.isLocalPreset(a) || store.bridge.isLocalPreset(b)
            ? 1
            : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      },

      actions: {
        addNewPreset: store.asyncAction((payload: {name: string}) => {
          return untrack(() => {
            const currentState = store();
            return store.bridge
              .addNewPreset(payload.name)
              .then(preset => store.set(_ => [preset, ...(_ ?? [])]))
              .then(() =>
                toast.success('Preset has been created', {
                  position: 'top-center',
                }),
              )
              .catch(() => {
                store.set(currentState);
                toast.error('Error while creating preset', {
                  position: 'top-center',
                });
              });
          });
        }),
        deletePreset: store.asyncAction((payload: Preset) => {
          return untrack(() => {
            const currentState = store();
            store.entity.removeBy(preset => preset.id === payload.id);
            store.idb.update(data =>
              data.filter(preset => preset.id !== payload.data.localSyncId),
            );

            return store.bridge
              .deletePreset(payload)
              .then(() =>
                toast.success('Preset has been deleted', {
                  position: 'top-center',
                }),
              )
              .catch(() => {
                store.set(currentState);
                toast.error('Error while deleting preset', {
                  position: 'top-center',
                });
              });
          });
        }),
        copyLink: store.asyncAction((payload: Preset) => {
          const data = window.btoa(JSON.stringify(payload));
          const link = `${window.location.origin}${window.location.pathname}?share_preset=${data}`;
          return navigator.clipboard.writeText(link);
        }),
        syncPreset: store.asyncAction((payload: Preset) => {
          return untrack(() => {
            const currentState = store();
            return store.bridge
              .addNewPreset(payload.name, payload.data)
              .then(preset =>
                store.entity.updateBy(
                  _ => _.id === payload.id,
                  () => preset,
                ),
              )
              .then(() =>
                toast.success('Local preset has been synchronized', {
                  position: 'top-center',
                }),
              )
              .catch(() => {
                store.set(currentState);
                toast.error('Error while synchronizing preset', {
                  position: 'top-center',
                });
              });
          });
        }),
        updatePresetWithCurrentState: store.asyncAction(
          (payload: {preset: Preset}) => {
            return untrack(() => {
              const currentState = store();

              return store.bridge
                .updatePreset(
                  payload.preset,
                  payload.preset.name,
                  store.bridge.getPresetDataFromState(),
                )
                .then(updatedPreset => {
                  store.entity.updateBy(
                    _ => _.id === payload.preset.id,
                    () => updatedPreset,
                  );
                  store.idb.update(data =>
                    data.map(preset => {
                      if (
                        preset.data.localSyncId ===
                        updatedPreset.data.localSyncId
                      ) {
                        preset.data = updatedPreset.data;
                      }
                      return preset;
                    }),
                  );
                })
                .then(() =>
                  toast.success('Preset has been updated', {
                    position: 'top-center',
                  }),
                )
                .catch(() => {
                  store.set(currentState);
                  toast.error('Error while updating preset', {
                    position: 'top-center',
                  });
                });
            });
          },
        ),
        updatePresetName: store.asyncAction(
          (payload: {preset: Preset; newName: string}) => {
            return untrack(() => {
              const currentState = store();
              return store.bridge
                .updatePreset(
                  payload.preset,
                  payload.newName,
                  payload.preset.data,
                )
                .then(updatedPreset => {
                  store.entity.updateBy(
                    _ => _.id === payload.preset.id,
                    () => updatedPreset,
                  );
                  store.idb.update(data =>
                    data.map(preset => {
                      if (
                        preset.data.localSyncId ===
                        updatedPreset.data.localSyncId
                      ) {
                        preset.name = payload.newName;
                      }
                      return preset;
                    }),
                  );
                })
                .then(() =>
                  toast.success('Preset has been updated', {
                    position: 'top-center',
                  }),
                )
                .catch(() => {
                  store.set(currentState);
                  toast.error('Error while updating preset', {
                    position: 'top-center',
                  });
                });
            });
          },
        ),
      },
    };
  });

export function getPresetsStore() {
  return provideAppState(PresetStoreDefinition);
}
