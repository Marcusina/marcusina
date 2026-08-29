import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { useIsWeb, ScreenHeader, SectionLabel, EmptyState } from "../components/ScreenKit";
import { getFeed, getPost } from "../api/community.api";

const TYPE_ICONS = {
  post: "chat-bubble-outline",
  article: "article",
  poll: "poll",
  reel: "movie",
};

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ─── COM-01 · COMMUNITY FEED ───
export function CommunityFeedScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { token, user } = useUser();

  const { data: feedResponse, isLoading, error } = useQuery({
    queryKey: ["communityFeed", user?._id],
    queryFn: () => getFeed(token),
    enabled: !!token,
  });

  const posts = Array.isArray(feedResponse) ? feedResponse : feedResponse?.data || [];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-2xl font-extrabold" style={{ color: theme.text }}>Community</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("GroupsDirectory")}
          className="flex-row items-center px-3 py-2 rounded-full"
          style={{ backgroundColor: theme.surfaceSubtle }}
        >
          <MaterialIcons name="group" size={18} color={theme.text} />
          <Text style={{ color: theme.text }} className="text-xs font-bold ml-1.5">Groups</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error || posts.length === 0 ? (
        <EmptyState
          icon="forum"
          title="No posts yet"
          description={error?.message || "Posts from the community will show up here."}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-4"}>
            <View className={isWeb ? "max-w-[640px]" : ""}>
              {posts.map((post) => {
                const authorName = post.author_name || post.author?.username || "Community Member";
                const isReel = post.type === "reel";
                return (
                  <TouchableOpacity
                    key={post._id}
                    activeOpacity={0.7}
                    onPress={() =>
                      isReel
                        ? navigation.navigate("Post", { postId: post._id })
                        : navigation.navigate("PostDetail", { id: post._id })
                    }
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    className="rounded-2xl p-4 border mb-3"
                  >
                    <View className="flex-row items-center mb-2">
                      {post.author_avatar ? (
                        <Image source={{ uri: post.author_avatar }} className="w-8 h-8 rounded-full mr-2.5" />
                      ) : (
                        <View style={{ backgroundColor: theme.primaryLight }} className="w-8 h-8 rounded-full items-center justify-center mr-2.5">
                          <MaterialIcons name="person" size={16} color={theme.primary} />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text style={{ color: theme.text }} className="text-sm font-bold">{authorName}</Text>
                        <Text style={{ color: theme.textMuted }} className="text-[11px]">{formatDate(post.created_at)}</Text>
                      </View>
                      <MaterialIcons name={TYPE_ICONS[post.type] || "chat-bubble-outline"} size={16} color={theme.textMuted} />
                    </View>
                    <Text style={{ color: theme.textSecondary }} className="text-sm leading-5" numberOfLines={3}>
                      {post.content || post.title || ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── COM-02 · POST DETAIL / COMMENTS (standard, non-Shorts posts) ───
export function PostDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { token } = useUser();
  const { id } = route?.params || {};

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(token, id),
    enabled: !!id && !!token,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Post" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState icon="error-outline" title="Couldn't load this post" description={error?.message} />
      </View>
    );
  }

  const authorName = post.author_name || post.author?.username || "Community Member";
  const comments = Array.isArray(post.comments) ? post.comments : [];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Post" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 flex-row items-center mb-3 ${isWeb ? "max-w-[560px]" : ""}`}>
            {post.author_avatar ? (
              <Image source={{ uri: post.author_avatar }} className="w-10 h-10 rounded-full mr-3" />
            ) : (
              <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="person" size={20} color={theme.primary} />
              </View>
            )}
            <View>
              <Text style={{ color: theme.text }} className="text-sm font-bold">{authorName}</Text>
              <Text style={{ color: theme.textMuted }} className="text-[11px]">{formatDate(post.created_at)}</Text>
            </View>
          </View>

          {post.title ? (
            <Text style={{ color: theme.text }} className={`text-lg font-extrabold mb-2 ${isWeb ? "max-w-[560px]" : ""}`}>
              {post.title}
            </Text>
          ) : null}

          <Text style={{ color: theme.text }} className={`text-sm leading-6 mb-3 ${isWeb ? "max-w-[560px]" : ""}`}>
            {post.content}
          </Text>

          {post.image_url ? (
            <Image source={{ uri: post.image_url }} className={`w-full h-56 rounded-2xl mb-3 ${isWeb ? "max-w-[560px]" : ""}`} resizeMode="cover" />
          ) : null}

          {Array.isArray(post.poll_options) && post.poll_options.length > 0 ? (
            <View className={`mb-3 ${isWeb ? "max-w-[560px]" : ""}`}>
              {post.poll_options.map((opt, i) => (
                <View
                  key={i}
                  style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}
                  className="rounded-xl p-3 border mb-2"
                >
                  <Text style={{ color: theme.text }} className="text-sm font-semibold">{opt.label || opt}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <SectionLabel>Comments</SectionLabel>
          {comments.length === 0 ? (
            <Text style={{ color: theme.textMuted }} className="text-sm">No comments yet.</Text>
          ) : (
            <View className={isWeb ? "max-w-[560px]" : ""}>
              {comments.map((c, i) => (
                <View key={c._id || i} style={{ borderColor: theme.border }} className="py-2.5 border-b">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{c.author_name || "Community Member"}</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-sm mt-0.5">{c.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
