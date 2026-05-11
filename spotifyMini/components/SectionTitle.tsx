import {
	Pressable,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from "react-native";

type SectionTitleProps = {
	title: string;
	actionLabel?: string;
	onPressAction?: () => void;
	style?: ViewStyle;
};

export function SectionTitle({
	title,
	actionLabel,
	onPressAction,
	style,
}: SectionTitleProps) {
	return (
		<View style={[styles.row, style]}>
			<Text style={styles.title}>{title}</Text>

			{actionLabel ? (
				<Pressable onPress={onPressAction} hitSlop={8}>
					<Text style={styles.action}>{actionLabel}</Text>
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 14,
	},
	title: {
		color: "#E5E2E1",
		fontSize: 24,
		fontWeight: "800",
		letterSpacing: -0.3,
	},
	action: {
		color: "#53E076",
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.9,
	},
});
