import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { getCart, updateCartItem, removeFromCart } from "../api/cart.api";

export function CartScreen({ onBackHome, onOpenPlace }) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  // Fetch cart query using TanStack
  const { data: cart, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  // Mutate quantity
  const updateQtyMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update quantity");
    },
  });

  // Remove item
  const removeMutation = useMutation({
    mutationFn: (itemId) => removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove item");
    },
  });

  const handleUpdateQty = (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    updateQtyMutation.mutate({ itemId, quantity: newQty });
  };

  const handleRemove = (itemId) => {
    removeMutation.mutate(itemId);
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = subtotal > 0 ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  const isMutating = updateQtyMutation.isLoading || removeMutation.isLoading;

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
          Loading Cart...
        </Text>
      </View>
    );
  }

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b" style={{ borderColor: theme.border }}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onBackHome} className="p-1.5 rounded-full" style={{ backgroundColor: theme.surfaceSubtle }}>
            <MaterialIcons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: theme.text }}>Shopping Cart</Text>
        </View>
        {hasItems && (
          <View className="px-2.5 py-1 rounded-full bg-teal-500/10">
            <Text className="text-xs font-bold text-teal-600 dark:text-teal-400">
              {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
            </Text>
          </View>
        )}
      </View>

      {!hasItems || error ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <View className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-teal-500/10">
            <MaterialIcons name="shopping-cart" size={40} color={theme.primary} />
          </View>
          <Text className="text-lg font-bold text-center mb-2" style={{ color: theme.text }}>
            Your cart is empty
          </Text>
          <Text className="text-sm text-center mb-8 max-w-[280px]" style={{ color: theme.textSecondary }}>
            Explore the pharmacy market to buy medications and health equipment.
          </Text>
          <TouchableOpacity
            onPress={onOpenPlace}
            className="px-8 py-3.5 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="font-bold text-[15px]" style={{ color: theme.mode === "dark" ? "#000" : "#fff" }}>
              Browse Marketplace
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-between">
          <ScrollView className="flex-1 px-4 py-4">
            {cart.items.map((item) => {
              const med = item.medication_id;
              if (!med) return null;

              const medImage = med.image_url && med.image_url[0]?.url
                ? med.image_url[0].url
                : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80";

              return (
                <View
                  key={item._id}
                  className="flex-row p-3 rounded-2xl border mb-3 items-center"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                  <Image
                    source={{ uri: medImage }}
                    className="w-[72px] h-[72px] rounded-xl mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1 justify-between py-1 h-[72px]">
                    <View>
                      <Text className="text-[14px] font-bold" numberOfLines={1} style={{ color: theme.text }}>
                        {med.medication_name}
                      </Text>
                      <Text className="text-[11px] font-semibold" style={{ color: theme.textMuted }}>
                        {med.generic_name} · {med.drug_class}
                      </Text>
                    </View>
                    <Text className="text-[15px] font-extrabold text-teal-600 dark:text-teal-400">
                      ${(item.unit_price).toFixed(2)}
                    </Text>
                  </View>

                  {/* Quantity Controls & Delete */}
                  <View className="items-end justify-between h-[72px]">
                    <TouchableOpacity
                      onPress={() => handleRemove(item._id)}
                      disabled={isMutating}
                      className="p-1 rounded-lg"
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>

                    <View className="flex-row items-center border rounded-xl" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
                      <TouchableOpacity
                        onPress={() => handleUpdateQty(item._id, item.quantity, -1)}
                        disabled={isMutating || item.quantity <= 1}
                        className="p-1.5 px-2.5 rounded-l-xl"
                      >
                        <Text className="text-xs font-bold" style={{ color: item.quantity <= 1 ? theme.textMuted : theme.text }}>-</Text>
                      </TouchableOpacity>
                      <Text className="text-xs font-bold px-1" style={{ color: theme.text }}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleUpdateQty(item._id, item.quantity, 1)}
                        disabled={isMutating}
                        className="p-1.5 px-2.5 rounded-r-xl"
                      >
                        <Text className="text-xs font-bold" style={{ color: theme.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Cart Summary */}
          <View
            className="p-5 border-t rounded-t-[28px]"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: theme.mode === "dark" ? 0.2 : 0.04,
              shadowRadius: 5,
              elevation: 8,
            }}
          >
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-semibold" style={{ color: theme.textSecondary }}>Subtotal</Text>
              <Text className="text-sm font-bold" style={{ color: theme.text }}>${subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-sm font-semibold" style={{ color: theme.textSecondary }}>Delivery Fee</Text>
              <Text className="text-sm font-bold" style={{ color: theme.text }}>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View className="h-[0.5px] mb-4" style={{ backgroundColor: theme.border }} />
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-base font-bold" style={{ color: theme.text }}>Total Price</Text>
              <Text className="text-xl font-black text-teal-600 dark:text-teal-400">${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toast.success("Checkout processing is coming soon!")}
              className="py-4 rounded-2xl items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="font-extrabold text-[15px]" style={{ color: theme.mode === "dark" ? "#000" : "#fff" }}>
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
