import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, Text, FlatList, TextInput, StyleSheet, 
  TouchableOpacity, ActivityIndicator, ScrollView, Image 
} from 'react-native';
import { getProducts, getCategories } from '../api/productService';
import { Product } from '../types/Product';

const ProductListScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-az');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pData, cData] = await Promise.all([getProducts(), getCategories()]);
      setProducts(pData);
      setCategories(['all', ...cData]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name-az') return a.title.localeCompare(b.title);
      if (sortBy === 'name-za') return b.title.localeCompare(a.title);
      return 0;
    });
  }, [products, debouncedSearch, selectedCategory, sortBy]);

  if (loading) return <ActivityIndicator size="large" color="#6200ee" style={styles.center} />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setSelectedCategory(cat)}
              style={[styles.chip, selectedCategory === cat && styles.activeChip]}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.activeChipText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort By:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SortBtn label="A-Z" id="name-az" current={sortBy} set={setSortBy} />
          <SortBtn label="Price ↓" id="price-low" current={sortBy} set={setSortBy} />
          <SortBtn label="Price ↑" id="price-high" current={sortBy} set={setSortBy} />
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No results found.</Text>}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          >

            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: item.image }} 
                    style={styles.thumbnail} 
                    resizeMode="contain" 
                />
            </View>

            <View style={styles.itemContent}>
                <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.itemRating}>⭐ {item.rating.rate}</Text>
                </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const SortBtn = ({ label, id, current, set }: any) => (
  <TouchableOpacity onPress={() => set(id)} style={styles.sortBtn}>
    <Text style={[styles.sortBtnText, current === id && styles.activeSortText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  categoryList: { marginBottom: 10 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eee', marginRight: 8 },
  activeChip: { backgroundColor: '#3F3F4E' },
  chipText: { textTransform: 'capitalize', color: '#444', fontSize: 13 },
  activeChipText: { color: '#fff' },
  sortRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingLeft: 5 },
  sortLabel: { fontWeight: 'bold', marginRight: 10, fontSize: 14, color: '#333' },
  sortBtn: { marginRight: 15 },
  sortBtnText: { color: '#888', fontSize: 14 },
  activeSortText: { color: '#3F3F4E', fontWeight: 'bold' },

  item: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: { width: '100%', height: '100%' },
  itemContent: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  itemCategory: { fontSize: 10, color: '#888', fontWeight: '700', marginBottom: 2 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#333', lineHeight: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  itemRating: { fontSize: 12, color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});

export default ProductListScreen;