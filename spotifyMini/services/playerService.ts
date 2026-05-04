import TrackPlayer, {
  Capability,
  Event
} from "react-native-track-player";

export async function setupPlayer() {
  await TrackPlayer.setupPlayer();

  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.SkipToNext,
      Capability.SkipToPrevious
    ],

    compactCapabilities: [
      Capability.Play,
      Capability.Pause
    ],

    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious
    ]
  });
}

export async function playbackService() {
  TrackPlayer.addEventListener(
    Event.RemotePlay,
    async () => {
      await TrackPlayer.play();
    }
  );

  TrackPlayer.addEventListener(
    Event.RemotePause,
    async () => {
      await TrackPlayer.pause();
    }
  );
}