import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { CartProvider }    from './context/CartContext';
import Navbar       from './components/Navbar';
import Footer       from './components/Footer';
import CartDrawer   from './components/CartDrawer';
import Home         from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout     from './pages/Checkout';
import './App.css';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ProductProvider>
  );
}
