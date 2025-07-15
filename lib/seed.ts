import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";
import * as FileSystem from "expo-file-system";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[];
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    try {
        const list = await databases.listDocuments(
            appwriteConfig.databaseId,
            collectionId
        );

        await Promise.all(
            list.documents.map((doc) =>
                databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
            )
        );
    } catch (error) {
        console.error(`Failed to clear collection ${collectionId}:`, error);
        throw error;
    }
}

async function clearStorage(): Promise<void> {
    try {
        const list = await storage.listFiles(appwriteConfig.bucketId);

        await Promise.all(
            list.files.map((file) =>
                storage.deleteFile(appwriteConfig.bucketId, file.$id)
            )
        );
    } catch (error) {
        console.error("Failed to clear storage:", error);
        throw error;
    }
}

async function uploadImageToStorage(imageUrl: string): Promise<string> {
    try {
        if (!imageUrl) {
            throw new Error("Image URL is undefined or empty.");
        }
        const fileName = imageUrl.split("/").pop() || `file-${Date.now()}.jpg`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        // Download the image
        const downloadResumable = FileSystem.createDownloadResumable(
            imageUrl,
            fileUri
        );

        const { uri } = await downloadResumable.downloadAsync();

        // Get file info (for size)
        const fileInfo = await FileSystem.getInfoAsync(uri);

        if (!fileInfo.exists) {
            throw new Error("Downloaded file does not exist.");
        }

        const file = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            {
                uri: uri,
                type: "image/jpeg",
                name: fileName,
                size: fileInfo.size ?? 0,
            }
        );

        console.log("Uploaded file result:", file);

        if (!file || !file.$id) {
            throw new Error("File upload failed: no file ID returned.");
        }

        const fileUrl = storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
        if (!fileUrl) {
            throw new Error("Failed to generate file view URL.");
        }

        return fileUrl;
    } catch (error) {
        console.error("Failed to upload image:", error);
        throw error;
    }
}

async function seed(): Promise<void> {
    try {
        console.log("⏳ Clearing database collections...");
        await clearAll(appwriteConfig.categoriesCollectionId);
        await clearAll(appwriteConfig.customizationsCollectionId);
        await clearAll(appwriteConfig.menuCollectionId);
        await clearAll(appwriteConfig.menuCustomizationsCollectionId);
        await clearStorage();
        console.log("✅ Cleared old data.");

        // Validate menu items
        for (const item of data.menu) {
            if (!item.imageUrl) {
                throw new Error(`Menu item '${item.name}' is missing imageUrl.`);
            }
            if (!item.category_name || !data.categories.some(cat => cat.name === item.category_name)) {
                throw new Error(`Menu item '${item.name}' has invalid category_name: ${item.category_name}`);
            }
            for (const cusName of item.customizations) {
                if (!data.customizations.some(cus => cus.name === cusName)) {
                    throw new Error(`Menu item '${item.name}' has invalid customization: ${cusName}`);
                }
            }
        }

        const categoryMap: Record<string, string> = {};
        for (const cat of data.categories) {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.categoriesCollectionId,
                ID.unique(),
                cat
            );
            categoryMap[cat.name] = doc.$id;
        }
        console.log("✅ Categories seeded.");

        const customizationMap: Record<string, string> = {};
        for (const cus of data.customizations) {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.customizationsCollectionId,
                ID.unique(),
                {
                    name: cus.name,
                    price: cus.price,
                    type: cus.type,
                }
            );
            customizationMap[cus.name] = doc.$id;
        }
        console.log("✅ Customizations seeded.");

        const menuMap: Record<string, string> = {};
        for (const item of data.menu) {
            console.log(`📥 Uploading image for: ${item.name}, Image URL: ${item.imageUrl}`);
            const uploadedImage = await uploadImageToStorage(item.imageUrl);
            console.log(`✅ Uploaded image for ${item.name}: ${uploadedImage}`);

            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menuCollectionId,
                ID.unique(),
                {
                    name: item.name,
                    description: item.description,
                    imageUrl: uploadedImage,
                    price: item.price,
                    rating: item.rating,
                    calories: item.calories,
                    protein: item.protein,
                    categories: categoryMap[item.category_name],
                }
            );

            menuMap[item.name] = doc.$id;

            for (const cusName of item.customizations) {
                const customizationId = customizationMap[cusName];
                console.log(`Creating menu customization: menu=${doc.$id}, customizations=${customizationId}`);
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.menuCustomizationsCollectionId,
                    ID.unique(),
                    {
                        menu: doc.$id,
                        customizations: customizationId, // Ensure this matches the schema attribute
                    }
                );
            }
        }

        console.log("✅ Menu items and customizations seeded.");
        console.log("🎉 Seeding complete.");
    } catch (error) {
        console.error("Failed to seed the database:", error);
        throw error;
    }
}

export default seed;