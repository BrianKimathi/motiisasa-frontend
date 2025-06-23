import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import About from './pages/About'
import Authentication from './pages/Authentication'
import CarDetailsPage from './pages/CarDetailsPage'
import Cars from './pages/Cars'
import Contact from './pages/Contact'
import SellCar from './pages/SellCar'
import SellerTypeSelection from './pages/SellerTypeSelection'
import ShowroomCorporateDetails from './pages/ShowroomCorporateDetails'
import User from './pages/User'
import UserTypeSelection from './pages/UserTypeSelection'
import VerifyOtp from './pages/VerifyOtp'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route >
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/cardetails" element={<CarDetailsPage />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sell-car" element={<SellCar />} />
          <Route path="/seller-type-selection" element={<SellerTypeSelection />} />
          <Route path="/showroom-corporate-details" element={<ShowroomCorporateDetails />} />
          <Route path="/user" element={<User />} />
          <Route path="/user-type-selection" element={<UserTypeSelection />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App


