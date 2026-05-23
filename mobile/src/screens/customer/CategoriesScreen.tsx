import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../hooks/useWorkers';
import { Category } from '../../types';

export function CategoriesScreen({ navigation }: any) {
  const { i18n } = useTranslation();
  const { data: categories = [] } = useCategories();

  const getCategoryName = (c: Category) => {
    if (i18n.language === 'hi') return c.nameHi;
    if (i18n.language === 'or') return c.nameOr;
    return c.nameEn;
  };

  return (
    <View className="flex-1 bg-background pt-14 px-4">
      <Text className="text-3xl font-extrabold text-white mb-6">All Services</Text>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="flex-row flex-wrap justify-between">
          {categories.map(cat => (
            <Pressable 
              key={cat.id}
              onPress={() => navigation.navigate('WorkerList', { categoryId: cat.id })}
              className="bg-surface border border-border rounded-2xl p-4 mb-4 items-center w-[48%]"
            >
              <View className="w-16 h-16 rounded-full bg-background items-center justify-center mb-3">
                <Text className="text-3xl">
                  {cat.id === 'plumber' ? '🔧' : 
                   cat.id === 'electrician' ? '⚡' : 
                   cat.id === 'mechanic' ? '🚗' : 
                   cat.id === 'clinic' ? '⚕️' : '🛠️'}
                </Text>
              </View>
              <Text className="text-textPrimary text-sm font-bold text-center" numberOfLines={2}>
                {getCategoryName(cat)}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
