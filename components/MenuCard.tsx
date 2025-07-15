import { Text, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { MenuItem } from "@/type";
import { appwriteConfig } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";

const MenuCard = ({ item: { $id, imageUrl, name, price } }: { item: MenuItem }) => {
    const imageUrlWithProject = `${imageUrl}?project=${appwriteConfig.projectId}`;
    const { addItem } = useCartStore();

    return (
        <TouchableOpacity className="menu-card" style={Platform.OS === 'android' ? { elevation: 10, shadowColor: '#878787' } : {}}>
            {imageUrlWithProject ? (
                <Image
                    source={{ uri: imageUrlWithProject }}
                    className="size-32 absolute -top-10"
                    resizeMode="contain"
                    onError={(e) => console.log("Image load error for", imageUrlWithProject, e.nativeEvent.error)}
                />
            ) : (
                <ActivityIndicator size="small" color="#0000ff" />
            )}
            <Text className="text-center base-bold text-dark-100 mb-2" numberOfLines={1}>{name}</Text>
            <Text className="body-regular text-gray-200 mb-4">From ${price}</Text>
            <TouchableOpacity onPress={() => addItem({ id: $id, name, price, image_url: imageUrlWithProject, customizations: [] })}>
                <Text className="paragraph-bold text-primary">Add to Cart +</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export default MenuCard;