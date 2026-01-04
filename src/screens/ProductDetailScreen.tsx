import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Product } from '../types/Product';
import { getProductDetails } from '../api/productService';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen = ({ route }: Props) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProductInfo = async () => {
    try {
      setLoading(true);
      const data = await getProductDetails(productId);
      setProduct(data);
    } catch (error) {
      console.error("Error loading product details:", error);
      Alert.alert("Error", "Could not fetch product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductInfo();
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category.toUpperCase()}</Text>
          <Text style={styles.title}>{product.title}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {product.rating.rate} ({product.rating.count})</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => Alert.alert("Success", "Product added to cart!")}
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { 
    width: '100%', 
    height: 300, 
    backgroundColor: '#fff', 
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0' 
  },
  image: { width: '100%', height: '100%' },
  infoContainer: { padding: 20 },
  category: { fontSize: 12, color: '#3F3F4E', fontWeight: 'bold', marginBottom: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32' },
  ratingBadge: { backgroundColor: '#f5f5f5', padding: 8, borderRadius: 8 },
  ratingText: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 30 },
  button: {
    backgroundColor: '#3F3F4E',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default ProductDetailScreen;