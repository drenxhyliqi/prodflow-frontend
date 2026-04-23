import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const Layout = ({children}) => {
    const [menuVisible, setMenuVisible] = useState(true)

    return (
        <>
            {/* Sidebar */}
            <div className="container-fluid px-0">
                <div className="row g-0">
                    {menuVisible && (
                        <div className="col-12 col-md-4 col-lg-2">
                            <Sidebar
                                menuVisible={menuVisible} 
                                setMenuVisible={setMenuVisible}
                            />
                        </div>
                    )}
                    
                    <div className={`${menuVisible ? 'd-none d-md-inline col-0 col-md-8 col-lg-10' : 'col-12 col-md-12 col-lg-12'}`}>
                        <div className="main">

                            {/* Header */}
                            <div className="sticky-top">
                                <Header 
                                    menuVisible={menuVisible} 
                                    setMenuVisible={setMenuVisible}
                                />
                            </div>

                            {/* Page Content */}
                            <div className="bg-light" style={{ height:'calc(100vh - 75px)' }}>
                                <div className="p-3 p-md-4">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Layout