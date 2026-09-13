import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUser } from "../../context/UserContext";
import { GroupsScreen } from "../../screens/GroupsScreen";
import { PostScreen } from "../../screens/PostScreen";
import { CommunityFeedScreen, MyPostsScreen, PostDetailScreen } from "../../screens/CommunityScreens";

const Stack = createNativeStackNavigator();

function GroupsScreenWrapper({ navigation }) {
  const { token } = useUser();
  return (
    <GroupsScreen
      token={token}
      onBackHome={() => navigation.navigate("CommunityFeed")}
      onOpenConsult={() => navigation.navigate("ConsultBooking")}
      onOpenProfile={() => navigation.navigate("Me", { screen: "MeHome" })}
    />
  );
}

function PostScreenWrapper({ route }) {
  return <PostScreen initialPostId={route.params?.postId ?? "short-2"} />;
}

export default function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
      <Stack.Screen name="MyPosts" component={MyPostsScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="GroupsDirectory" component={GroupsScreenWrapper} />
      <Stack.Screen
        name="Post"
        component={PostScreenWrapper}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerTintColor: "#FFFFFF",
        }}
      />
      {/* CreatePost lives as a top-level screen in MainStack instead of here -
          nesting it under Community made cross-tab navigation to it (e.g.
          from Home's FAB) unreliable once Community was already mounted
          elsewhere in the stack: navigate() would just refocus the existing
          Community entry without drilling into CreatePost. */}
    </Stack.Navigator>
  );
}
