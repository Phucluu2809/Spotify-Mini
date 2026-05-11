import {
	ImageBackground,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

type PlaylistCardProps = {
	label: string;
	title: string;
	subtitle: string;
	image: string;
	accentColor: string;
	onPress?: () => void;
};

export function PlaylistCard({
	label,
	title,
	subtitle,
	image,
	accentColor,
	onPress,
}: PlaylistCardProps) {
	return (
		<Pressable style={[styles.card, { backgroundColor: accentColor }]} onPress={onPress}>
			<ImageBackground source={{ uri: image }} style={styles.background} imageStyle={styles.image}>
				<View style={styles.overlay}>
					<View style={styles.badge}>
						<Text style={styles.badgeText}>{label}</Text>
					</View>

					<Text style={styles.title} numberOfLines={2}>
						{title}
					</Text>

					<Text style={styles.subtitle} numberOfLines={2}>
						{subtitle}
					</Text>
				</View>
			</ImageBackground>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 16,
		overflow: "hidden",
		minHeight: 192,
		marginBottom: 12,
	},
	background: {
		minHeight: 192,
	},
	image: {
		borderRadius: 16,
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.18)",
		padding: 24,
		justifyContent: "flex-end",
	},
	badge: {
		alignSelf: "flex-start",
		backgroundColor: "#99D59D",
		borderRadius: 999,
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginBottom: 12,
	},
	badgeText: {
		color: "#002108",
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 0.7,
	},
	title: {
		color: "#E5E2E1",
		fontSize: 30,
		fontWeight: "900",
		fontStyle: "italic",
		marginBottom: 4,
		letterSpacing: -0.4,
	},
	subtitle: {
		color: "rgba(229, 226, 225, 0.8)",
		fontSize: 14,
		lineHeight: 20,
	},
});
