import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../store/useStore';
import { Product, Order, ProductCategory } from '../types';

// Auth screens
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';

// Seller screens
import { SellerHomeScreen } from '../screens/seller/SellerHomeScreen';
import { SellerProductsScreen } from '../screens/seller/SellerProductsScreen';
import { ProductDetailScreen } from '../screens/seller/ProductDetailScreen';
import { CartScreen } from '../screens/seller/CartScreen';
import { CheckoutScreen } from '../screens/seller/CheckoutScreen';
import { OrderTrackingScreen } from '../screens/seller/OrderTrackingScreen';
import { SellerLedgerScreen } from '../screens/seller/SellerLedgerScreen';
import { SellerProfileScreen } from '../screens/seller/SellerProfileScreen';

// Company screens
import { CompanyDashboardScreen } from '../screens/company/CompanyDashboardScreen';
import { CompanyProductsScreen } from '../screens/company/CompanyProductsScreen';
import { AddEditProductScreen } from '../screens/company/AddEditProductScreen';
import { CompanyOrdersScreen } from '../screens/company/CompanyOrdersScreen';
import { CompanyLedgerScreen } from '../screens/company/CompanyLedgerScreen';

// Shared screens
import { ChatScreen } from '../screens/shared/ChatScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';

// Common components
import { AnimatedTabBar } from '../components/common/AnimatedTabBar';

type SubScreen =
  | 'none'
  | 'product_detail'
  | 'checkout'
  | 'order_tracking'
  | 'add_edit_product'
  | 'chat'
  | 'notifications';

export const RootNavigator: React.FC = () => {
  const {
    user,
    role,
    isOnboarded,
    activeTab,
    setActiveTab,
    themeMode,
    colors,
    orders,
  } = useStore();

  const [showSplash, setShowSplash] = useState(true);
  const [subScreen, setSubScreen] = useState<SubScreen>('none');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<ProductCategory | undefined>(undefined);
  const [chatCompanyName, setChatCompanyName] = useState<string>('Super Star Group (SSG)');

  // 1. Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Onboarding Screen
  if (!isOnboarded) {
    return <OnboardingScreen onFinish={() => {}} />;
  }

  // 3. Auth Screen (Login / Signup)
  if (!user) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  // 4. Subscreens Overlay Handling
  if (subScreen === 'product_detail' && selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={() => setSubScreen('none')}
        onNavigateToCart={() => {
          setSubScreen('none');
          setActiveTab('Cart');
        }}
        onOpenChat={compName => {
          setChatCompanyName(selectedProduct.companyName);
          setSubScreen('chat');
        }}
        onSelectRelated={related => setSelectedProduct(related)}
      />
    );
  }

  if (subScreen === 'checkout') {
    return (
      <CheckoutScreen
        onBack={() => setSubScreen('none')}
        onOrderSuccess={placedOrder => {
          setSelectedOrder(placedOrder);
          setSubScreen('order_tracking');
        }}
      />
    );
  }

  if (subScreen === 'order_tracking' && selectedOrder) {
    return (
      <OrderTrackingScreen
        order={selectedOrder}
        onBack={() => setSubScreen('none')}
        onReorder={reordered => {
          setSubScreen('none');
          setActiveTab('Cart');
        }}
      />
    );
  }

  if (subScreen === 'add_edit_product') {
    return (
      <AddEditProductScreen
        productToEdit={productToEdit}
        onBack={() => {
          setProductToEdit(undefined);
          setSubScreen('none');
        }}
        onSuccess={() => {
          setProductToEdit(undefined);
          setSubScreen('none');
        }}
      />
    );
  }

  if (subScreen === 'chat') {
    return (
      <ChatScreen
        companyName={chatCompanyName}
        onBack={() => setSubScreen('none')}
      />
    );
  }

  if (subScreen === 'notifications') {
    return (
      <NotificationsScreen
        onBack={() => setSubScreen('none')}
        onSelectNotification={notif => {
          if (notif.linkId) {
            const found = orders.find(o => o.id === notif.linkId);
            if (found) {
              setSelectedOrder(found);
              setSubScreen('order_tracking');
            }
          }
        }}
      />
    );
  }

  // 5. Main Tab Content based on Role
  const renderTabContent = () => {
    if (role === 'COMPANY') {
      switch (activeTab) {
        case 'Dashboard':
          return (
            <CompanyDashboardScreen
              onNavigateToUpload={() => {
                setProductToEdit(undefined);
                setSubScreen('add_edit_product');
              }}
              onNavigateToProducts={() => setActiveTab('Products')}
              onNavigateToOrders={() => setActiveTab('Orders')}
              onNavigateToLedger={() => setActiveTab('Ledger')}
            />
          );
        case 'Products':
          return (
            <CompanyProductsScreen
              onAddProduct={() => {
                setProductToEdit(undefined);
                setSubScreen('add_edit_product');
              }}
              onEditProduct={prod => {
                setProductToEdit(prod);
                setSubScreen('add_edit_product');
              }}
            />
          );
        case 'Orders':
          return <CompanyOrdersScreen />;
        case 'Ledger':
          return <CompanyLedgerScreen />;
        case 'Profile':
          return (
            <SellerProfileScreen
              onOpenNotifications={() => setSubScreen('notifications')}
            />
          );
        default:
          return (
            <CompanyDashboardScreen
              onNavigateToUpload={() => {
                setProductToEdit(undefined);
                setSubScreen('add_edit_product');
              }}
              onNavigateToProducts={() => setActiveTab('Products')}
              onNavigateToOrders={() => setActiveTab('Orders')}
              onNavigateToLedger={() => setActiveTab('Ledger')}
            />
          );
      }
    } else {
      // SELLER role
      switch (activeTab) {
        case 'Home':
          return (
            <SellerHomeScreen
              onSelectProduct={prod => {
                setSelectedProduct(prod);
                setSubScreen('product_detail');
              }}
              onNavigateToCatalog={cat => {
                setSelectedCatalogCategory(cat);
                setActiveTab('Products');
              }}
              onOpenNotifications={() => setSubScreen('notifications')}
              onOpenChat={() => setSubScreen('chat')}
            />
          );
        case 'Products':
          return (
            <SellerProductsScreen
              initialCategory={selectedCatalogCategory}
              onSelectProduct={prod => {
                setSelectedProduct(prod);
                setSubScreen('product_detail');
              }}
            />
          );
        case 'Cart':
          return (
            <CartScreen
              onProceedCheckout={() => setSubScreen('checkout')}
              onExploreProducts={() => setActiveTab('Products')}
            />
          );
        case 'Ledger':
          return <SellerLedgerScreen />;
        case 'Profile':
          return (
            <SellerProfileScreen
              onOpenNotifications={() => setSubScreen('notifications')}
            />
          );
        default:
          return (
            <SellerHomeScreen
              onSelectProduct={prod => {
                setSelectedProduct(prod);
                setSubScreen('product_detail');
              }}
              onNavigateToCatalog={cat => {
                setSelectedCatalogCategory(cat);
                setActiveTab('Products');
              }}
              onOpenNotifications={() => setSubScreen('notifications')}
              onOpenChat={() => setSubScreen('chat')}
            />
          );
      }
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.screenContainer}>{renderTabContent()}</View>
      <AnimatedTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
