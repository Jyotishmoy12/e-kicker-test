import React from 'react'
import Navbar from "../components/Navbar"
import ImageCarousel from '../components/ImageCarousel'
import ProductComponent from '../components/ProductComponent'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
    <Navbar/>
    <ImageCarousel/>
    <ProductComponent/>
    <Footer/>
    </>
    
  )
}

export default Home