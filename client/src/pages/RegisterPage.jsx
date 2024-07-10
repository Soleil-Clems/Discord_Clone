import React from 'react'
import Register from '../components/Register'

export default function RegisterPage() {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-[url('discordbg.svg')] bg-cover">
      <img src="discordlogo.svg" className='fixed top-10 left-10' alt="logo" />
      <Register />
    </div>
  )
}
