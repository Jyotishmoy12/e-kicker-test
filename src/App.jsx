import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import React from 'react'
import Home from './Pages/Home'
import ProductDetails from './Pages/ProductDetails'
import Account from './Pages/Account'
import AboutUs from './Pages/AboutUs'
import Careers from './Pages/Careers'
import Services from './Pages/Services'
import Contact from './Pages/Contact'
import AdminDashboard from './Pages/AdminDashboard'
import PrivateRoute from './Pages/PrivateRoute'
import CartPage from './Pages/CartPage'
import RDPage from './Pages/RDPage'
import CheckOutPage from './Pages/CheckOutPage'
import OrderConfirmationPage from './Pages/OrderConfirmationPage'
import WishlistPage from './Pages/WishlistPage';
import TermsOfUse from './Pages/TermsOfUse';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import Repairing from './Pages/Repairing';
import ProjectPrototyping from './Pages/ProjectPrototyping';
import ProductsPage from './Pages/ProductsPage';
import ScrollToTop from './components/ScrollToTop';
import OrderConfirmation from './Pages/OrderConfirmation';
import ProfilePage from './Pages/ProfilePage';
import SellerForm from './Pages/SellerForm';
import SellerProfile from './Pages/SellerProfile';
import SellerDashboard from './Pages/SellerDashboard';
import SellerProductsPage from './Pages/SellerProductPage';
import SellerProductDetailsPage from './Pages/SellerProductDetailsPage';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <>
    <AuthProvider>
    <Router>
      <ScrollToTop/>
    <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/productDetails/:id" element={<ProductDetails/>}/>
            <Route path="/account" element={<Account/>}/>
            <Route path="/about-us" element={<AboutUs/>}/>
            <Route path="/careers" element={<Careers/>}/>
            <Route path="/services" element={<Services/>}/>
            <Route path="/contact" element={<Contact/>}/>
            <Route path="/cart" element={<CartPage/>}/>
            <Route path ="/r&d" element={<RDPage/>}/>
            <Route path="/checkout" element={<CheckOutPage/>}/>
            {/* <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} /> */}
            <Route path ="/wishlist" element={<WishlistPage/>}/>
            <Route path="/termsofuse" element={<TermsOfUse/>}/>
            <Route path="/privacypolicy" element={<PrivacyPolicy/>}/>
            <Route path="/repairing" element={<Repairing/>}/>
            <Route path ="/project-prototyping" element={<ProjectPrototyping/>}/>
            <Route path ="/products" element={<ProductsPage/>}/>
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/seller-form" element={<SellerForm />} />
            <Route path="/seller-profile/:sellerId" element={<SellerProfile />} />
            <Route path="/seller-dashboard/:sellerId" element={<SellerDashboard />} />
            <Route path="/sellerProducts" element={<SellerProductsPage />} />
            <Route path="/product/:productId" element={<SellerProductDetailsPage />} />


            {/* <Route path="/edit-product/:id" component={EditProduct} /> */}
            <Route path="/admin" element={
          <PrivateRoute adminOnly={true}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        </Routes>
    </Router>
    </AuthProvider>
    </>
  )
}

export default App