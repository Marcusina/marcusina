import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { getWishlist, removeFromWishlist } from "../api/wishlist.api";
import { addToCart } from "../api/cart.api";

export function WishlistScreen({ onBackHome, onOpenPlace }) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  // Fetch wishlist query using TanStack
  const { data: wishlist, isLoading, error } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: (itemId) => removeFromWishlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Item removed from wishlist");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove item");
    },
  });

  // Add to cart and remove mutation
  const moveToCartMutation = useMutation({
    mutationFn: async (item) => {
      const medId = item.medication_id?._id;
      if (!medId) throw new Error("Invalid medication ID");
      await addToCart(medId, 1);
      await removeFromWishlist(item._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Moved item to cart!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to move item to cart");
    },
  });

  const handleRemove = (itemId) => {
    removeMutation.mutate(itemId);
  };

  const handleAddToCart = (item) => {
    moveToCartMutation.mutate(item);
  };

  const isMutating = removeMutation.isLoading || moveToCartMutation.isLoading;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
          width: "100%",
          height: "100%",
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 12, color: theme.textSecondary, fontWeight: "500" }}>
          Loading Wishlist...
        </Text>
      </View>
    );
  }

  const hasItems = wishlist && wishlist.items && wishlist.items.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b" style={{ borderColor: theme.border }}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onBackHome} className="p-1.5 rounded-full" style={{ backgroundColor: theme.surfaceSubtle }}>
            <MaterialIcons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: theme.text }}>My Wishlist</Text>
        </View>
        {hasItems && (
          <View className="px-2.5 py-1 rounded-full bg-pink-500/10">
            <Text className="text-xs font-bold text-pink-600 dark:text-pink-400">
              {wishlist.items.length} {wishlist.items.length === 1 ? "item" : "items"}
            </Text>
          </View>
        )}
      </View>

      {!hasItems || error ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <View className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-pink-500/10">
            <Ionicons name="heart" size={40} color={theme.mode === "dark" ? "#F43F5E" : "#E11D48"} />
          </View>
          <Text className="text-lg font-bold text-center mb-2" style={{ color: theme.text }}>
            Your wishlist is empty
          </Text>
          <Text className="text-sm text-center mb-8 max-w-[280px]" style={{ color: theme.textSecondary }}>
            Tap the heart icon on any health product or medicine to save it for later.
          </Text>
          <TouchableOpacity
            onPress={onOpenPlace}
            className="px-8 py-3.5 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="font-bold text-[15px]" style={{ color: theme.mode === "dark" ? "#000" : "#fff" }}>
              Explore Marketplace
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          <View className="flex-row flex-wrap justify-between">
            {wishlist.items.map((item) => {
              const med = item.medication_id;
              if (!med) return null;

              const medImage = med.image_url && med.image_url[0]?.url
                ? med.image_url[0].url
                : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80";

              return (
                <View
                  key={item._id}
                  className="w-[48%] md:w-[31%] p-3 rounded-2xl border mb-4 flex-col justify-between"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                  <View className="relative mb-3">
                    <Image
                      source={{ uri: medImage }}
                      className="w-full h-32 rounded-xl"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => handleRemove(item._id)}
                      disabled={isMutating}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 items-center justify-center"
                    >
                      <MaterialIcons name="close" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-1 mb-3">
                    <Text className="text-xs font-semibold" style={{ color: theme.textMuted }} numberOfLines={1}>
                      {med.generic_name}
                    </Text>
                    <Text className="text-[14px] font-bold mt-0.5" style={{ color: theme.text }} numberOfLines={2}>
                      {med.medication_name}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between mt-auto">
                    <TouchableOpacity
                      onPress={() => handleAddToCart(item)}
                      disabled={isMutating}
                      className="flex-1 py-2 px-3 rounded-xl flex-row items-center justify-center gap-1.5"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <MaterialIcons name="shopping-cart" size={14} color={theme.mode === "dark" ? "#000" : "#fff"} />
                      <Text className="text-xs font-bold" style={{ color: theme.mode === "dark" ? "#000" : "#fff" }}>
                        Add to Cart
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
