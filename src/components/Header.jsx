import React, { useState } from 'react'
import { LuMenu } from 'react-icons/lu'

const Header = ({ menuVisible, setMenuVisible }) => {
    return (
        <header className='border-bottom bg-white'>
            <div className="d-flex justify-content-between align-items-center p-3">
                <div>
                    <button className='btn btn-transparent border-0' onClick={() => setMenuVisible(!menuVisible)}>
                        <LuMenu size={28}/>
                    </button>
                </div>
                <div>
                    <button className='btn btn-transparent border-0' onClick={() => setMenuVisible(!menuVisible)}>
                        <LuMenu size={28}/>
                    </button>
                    <button className='btn btn-transparent border-0' onClick={() => setMenuVisible(!menuVisible)}>
                        <LuMenu size={28}/>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
