import React from 'react'
import { Link } from 'react-router-dom'

const Layout = ({children}) => {
    return (
        <>
            <h1>HI</h1>
            <Link to="/">Home</Link>
            {children}
        </>
    )
}

export default Layout