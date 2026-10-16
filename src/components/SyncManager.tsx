import { useEffect } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setOnline } from '@/store/syncSlice';
import { runSync } from '@/store/syncThunks';

const INTERVAL_MS = 60_000;

/** Invisible component: decides WHEN to sync. The work itself is in runSync. */
export function SyncManager() {
  const dispatch = useAppDispatch();
  const signedIn = useAppSelector((s) => s.auth.status === 'signedIn');
  const pendingCount = useAppSelector((s) => s.sync.pendingCount);
  const online = useAppSelector((s) => s.sync.online);

  // Track connectivity; sync as soon as the connection comes back
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected !== false && state.isInternetReachable !== false;
      dispatch(setOnline(connected));
      if (connected) dispatch(runSync());
    });
    return unsubscribe;
  }, [dispatch]);

  // Sync when the app returns to the foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') dispatch(runSync());
    });
    return () => sub.remove();
  }, [dispatch]);

  // Sync shortly after something changes (debounced so a burst of edits is one upload)
  useEffect(() => {
    if (!signedIn || pendingCount === 0 || !online) return;
    const t = setTimeout(() => dispatch(runSync()), 1500);
    return () => clearTimeout(t);
  }, [dispatch, signedIn, pendingCount, online]);

  // And a gentle pull every minute so changes from another device show up
  useEffect(() => {
    if (!signedIn) return;
    dispatch(runSync());
    const id = setInterval(() => dispatch(runSync()), INTERVAL_MS);
    return () => clearInterval(id);
  }, [dispatch, signedIn]);

  return null;
}