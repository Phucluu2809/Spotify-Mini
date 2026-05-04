import TrackPlayer from "react-native-track-player";

import { playbackService } from "./services/playerService";

TrackPlayer.registerPlaybackService(
  () => playbackService
);