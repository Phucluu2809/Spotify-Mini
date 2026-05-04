import {
	Image,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

type ArtistCardProps = {
	title: string;
	subtitle: string;
	image: string;
	onPress?: () => void;
};

export function ArtistCard({
	title,
	subtitle,
	image,
	onPress,
}: ArtistCardProps) {
	return (
		<Pressable style={styles.card} onPress={onPress}>
			<Image source={{ uri: image }} style={styles.image} />

			<View style={styles.textBlock}>
				<Text style={styles.title} numberOfLines={1}>
					{title}
				</Text>
				<Text style={styles.subtitle} numberOfLines={1}>
					{subtitle}
				</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		width: 163,
		backgroundColor: "#1C1B1B",
		borderRadius: 16,
		overflow: "hidden",
	},
	image: {
		width: "100%",
		height: 131,
		backgroundColor: "#2C2B2B",
	},
	textBlock: {
		paddingHorizontal: 14,
		paddingTop: 14,
		paddingBottom: 16,
	},
	title: {
		color: "#E5E2E1",
		fontSize: 14,
		fontWeight: "800",
		marginBottom: 4,
	},
	subtitle: {
		color: "#BCCBB9",
		fontSize: 12,
	},
});
