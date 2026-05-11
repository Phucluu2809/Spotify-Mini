import {
	Image,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

type SongCardProps = {
	rank: string;
	title: string;
	artist: string;
	duration: string;
	image: string;
	onPress?: () => void;
};

export function SongCard({
	rank,
	title,
	artist,
	duration,
	image,
	onPress,
}: SongCardProps) {
	return (
		<Pressable style={styles.row} onPress={onPress}>
			<Text style={styles.rank}>{rank}</Text>

			<Image source={{ uri: image }} style={styles.image} />

			<View style={styles.details}>
				<Text style={styles.title} numberOfLines={1}>
					{title}
				</Text>
				<Text style={styles.artist} numberOfLines={1}>
					{artist}
				</Text>
			</View>

			<View style={styles.meta}>
				<Text style={styles.duration}>{duration}</Text>
				<View style={styles.playButton}>
					<Text style={styles.playIcon}>▶</Text>
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingVertical: 12,
	},
	rank: {
		width: 28,
		color: "#E5E2E1",
		fontSize: 16,
		fontWeight: "800",
	},
	image: {
		width: 54,
		height: 54,
		borderRadius: 14,
		backgroundColor: "#2A2A2A",
	},
	details: {
		flex: 1,
	},
	title: {
		color: "#E5E2E1",
		fontSize: 16,
		fontWeight: "800",
		marginBottom: 4,
	},
	artist: {
		color: "#BCCBB9",
		fontSize: 12,
	},
	meta: {
		alignItems: "flex-end",
		gap: 8,
	},
	duration: {
		color: "#E5E2E1",
		fontSize: 12,
		fontWeight: "700",
	},
	playButton: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#53E076",
		alignItems: "center",
		justifyContent: "center",
	},
	playIcon: {
		color: "#002108",
		fontSize: 11,
		fontWeight: "900",
		marginLeft: 1,
	},
});
