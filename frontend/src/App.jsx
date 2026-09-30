import { Routes, Route, Navigate } from "react-router";
import Shop from './Pages/shop';
import './App.css';
import Home from './Pages/home';
import Categoryproducts from './Pages/categoryproducts';
import Categories from './Pages/categories';
import NewArrivals from './Pages/newarrival';
import Sale from './Pages/sale';
import Search from './Pages/search';
import MyAccount from './Pages/myacoount';
import Wishlist from './Pages/wishlist';
import Cart from './Pages/cart';
import ProductDetails from './Pages/product';
import AccountSetting from './Pages/accountsetting';
import Address from './Pages/adress';
import Login from './Pages/Authpage/login';
import Signup from './Pages/Authpage/signup';
import useAuthuser from './hooks/authuser';
import AdminDashboard from './Pages/Admin/admindashboard';
import AddProduct from './Pages/product/addproduct';
import Products from './Pages/product/products';
import Orders from './Pages/Admin/order';
import ProductCategories from './Pages/product/productcategory';
import AdminSettings from './Pages/Admin/adminsetting';
import AdminProductEdit from './Pages/product/updateproduct';
import TrackOrder from './Pages/order/trackorder';
import OrderSuccess from './Pages/order/order.success';
import CashfreeReturn from './Pages/order/cashfree.return';
import Checkout from './Pages/order/checkout';
import Orderss from "./Pages/order/orders";
import OrderDetails from "./Pages/order/OrderDetails";
import Orderdetails from "./Pages/Admin/adminorderdetails";
import Customer from "./Pages/Admin/AdminCustomer";
import AdminCustomerDetails from "./Pages/Admin/AdminCustomerDetails";
import AdminDiscount from "./Pages/Admin/AdminDiscount";
import CreateAdmin from "./Pages/Admin/Createadmin";
import Maintenance from "./Pages/maintance";
import MaintenanceGuard from "./components/MaintenanceGuard";
import ForgotPassword from "./Pages/forgetpassword";
import VerifyResetCode from "./Pages/verifyresetcode";
import ResetPassword from "./Pages/resetcode";
function App() {
  const { isLoading, authuser } = useAuthuser();

  const isauth = Boolean(authuser);
  const isAdmin = authuser?.role === 'admin';
  const adminPage = (page) => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center" role="status">Loading...</div>;
    }

    return isAdmin ? page : <Navigate to="/" replace />;
  };

  return (
    <MaintenanceGuard>
   <Routes>
       <Route path='/' element={<Home/>} />
       <Route path='/shop' element={<Shop/>} />
         <Route
    path="/categories"
    element={<Categories />}
  />
        <Route
    path="/category/:slug"
    element={<Categoryproducts/>}
  />
  <Route
  path="/new-arrivals"
  element={<NewArrivals />}
/>
<Route path='/sale' element ={<Sale/>}/>
<Route path='/wishlist' element ={<Wishlist/>}/>
<Route path='/cart' element ={<Cart/>}/>
    <Route
  path="/search"
  element={<Search />}
/>
    <Route
  path="/myaccount/:id"
  element={isauth?<MyAccount /> : <Navigate to={`/api/login`}/>}
/>
 <Route
        path="/account/addresses"
        element={isauth?<Address />: <Navigate to={`/api/login`}/>}
      />

      <Route
        path="/account/settings"
        element={isauth?<AccountSetting />: <Navigate to={`/api/login`}/>}
      />
<Route path='/product/:id' element={<ProductDetails/>}/>
  <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-5xl font-black">
                404
              </h1>

              <p className="mt-3 text-gray-500">
                Page not found
              </p>
            </div>
          </div>
        }
      />
  <Route path='/api/login' element={!isauth?<Login/> : <Navigate to={`/myaccount/${authuser._id}`}/>}/>
  <Route path='/api/signup' element={!isauth?<Signup/>:<Navigate to={`/myaccount/${authuser._id}`}/>}/>
  <Route  path='/forgot-password' element={!isauth?<ForgotPassword/>:<Navigate to={`/myaccount/${authuser._id}`}/>}/>



<Route
  path="/verify-reset-code"
  element={!isauth ? <VerifyResetCode /> : <Navigate to={`/myaccount/${authuser._id}`} />}
/>

<Route
  path="/reset-password"
  element={!isauth ? <ResetPassword /> : <Navigate to={`/myaccount/${authuser._id}`} />}
/>
   <Route
    path="/admin"
    element={adminPage(<AdminDashboard />)}
  />

  <Route
    path="/admin/products/new"
    element={adminPage(<AddProduct />)}
  />
<Route
  path="/admin/products"
  element={adminPage(<Products />)}
/>

<Route
  path="/admin/orders"
  element={adminPage(<Orders />)}
/>

<Route
  path="/admin/categories"
  element={adminPage(<ProductCategories />)}
/>
<Route path="/admin/settings" element={adminPage(<AdminSettings />)} />
<Route
  path="/admin/products/:id"
  element={adminPage(<AdminProductEdit />)}
/>
<Route
  path="/admin/customers"
  element={adminPage(<Customer />)}
/>
<Route
  path="/admin/customers/:email"
  element={adminPage(<AdminCustomerDetails />)}
/>
<Route
  path="/admin/discounts"
  element={adminPage(<AdminDiscount />)}
/>
<Route
  path="/admin/createadmin"
  element={adminPage(<CreateAdmin />)}
/>
<Route
  path="/maintenance"
  element={<Maintenance />}
/>
   <Route path="/track-order" element={<TrackOrder />} />
    <Route path="/order-success" element={<OrderSuccess />} />
    <Route path="/order-success/:orderId" element={<OrderSuccess />} />
    <Route path="/payment/cashfree/return" element={<CashfreeReturn />} />
    <Route path ="/checkout" element={<Checkout/>}/>
    <Route path="/account/orders" element={<Orderss />} />
    <Route path="/account/orders/:orderId" element={<OrderDetails />} />
    <Route path="admin/orders/:orderId" element={adminPage(<Orderdetails />)} />
   </Routes>
   </MaintenanceGuard>


  )
}

export default App
