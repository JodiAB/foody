import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { account, storage } from '@/lib/appwrite';
import useAuthStore  from '@/store/auth.store';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                setName(user.name || 'User');
                setEmail(user.email || 'No email');
                setPhone(user.phone || 'No phone');
                setAddress1(user.address1 || 'No address');
                setAddress2(user.address2 || 'No address');
                setProfileImage(user.profileImage || '');
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    const getInitials = () => {
        if (!name) return 'U';
        const names = name.split(' ');
        return names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
    };

    const handleEditProfile = () => {
        // Navigate to edit profile screen or open edit modal
        console.log('Edit profile clicked');
    };

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FFA726" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Nav */}
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => console.log('Back pressed')}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Profile</Text>
                <TouchableOpacity onPress={() => console.log('Search pressed')}>
                    <Feather name="search" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Picture */}
                <View style={styles.avatarContainer}>
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.avatar}
                            onError={() => setProfileImage('')}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.initialsContainer]}>
                            <Text style={styles.initialsText}>{getInitials()}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
                        <MaterialIcons name="edit" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Profile Info */}
                <View style={styles.infoBox}>
                    <InfoItem icon="person" label="Full Name" value={name} />
                    <InfoItem icon="email" label="Email" value={email} />
                    <InfoItem icon="call" label="Phone number" value={phone} />
                    <InfoItem
                        icon="location-on"
                        label="Address 1 - (Home)"
                        value={address1}
                    />
                    <InfoItem
                        icon="location-on"
                        label="Address 2 - (Work)"
                        value={address2}
                    />
                </View>

                {/* Buttons */}
                <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
        <MaterialIcons name={icon} size={22} color="#FFA726" style={styles.infoIcon} />
        <View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || 'Not set'}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 16,
    },
    title: { fontSize: 20, fontWeight: 'bold' },
    content: { alignItems: 'center', paddingBottom: 30 },
    avatarContainer: { marginTop: 20, alignItems: 'center' },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    initialsContainer: {
        backgroundColor: '#FFA726',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 110,
        backgroundColor: '#FFA726',
        borderRadius: 15,
        padding: 4,
    },
    infoBox: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        margin: 20,
        borderRadius: 12,
        width: '90%',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    infoIcon: { marginRight: 12, marginTop: 2 },
    infoLabel: { fontSize: 12, color: '#777' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
    editButton: {
        backgroundColor: '#FFE0B2',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#FFA726',
        marginTop: 20,
    },
    editButtonText: {
        color: '#FFA726',
        fontWeight: '600',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: '#FFCDD2',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#E53935',
        marginTop: 20,
    },
    logoutButtonText: {
        color: '#E53935',
        fontWeight: '600',
        fontSize: 16,
    },
});