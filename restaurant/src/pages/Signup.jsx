import React from 'react'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const navigateTo = useNavigate();
  const [formInput, setFormInput] = React.useState({
        email: "",
        password: "",
    })
  const handleForm = () => {
        console.log(formInput)
        setFormInput({
            email: "",
            password: "",
        })
    }
  return (
    <div className=" bg-gray-100 relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-full p-6 m-auto bg-white rounded-md ring-2 ring-purple-600 lg:max-w-xl">
        <h1 className='text-3xl font-semibold text-center uppercase text-purple-700'>Sign up</h1>
        <form>
          <div className='mb-2'>
            <label htmlFor='email' className='block text-sm font-semibold text-gray-800'>Email</label>
            <input 
              value={formInput.email}
              onChange={(e) => setFormInput({...formInput, email:e.target.value})}
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              type='email'/>
          </div>
          <div>
            <label htmlFor='password' className="block text-sm font-semibold text-gray-800">Password</label>
            <input 
              value={formInput.password}
              onChange={(e) => setFormInput({...formInput, password:e.target.value})}
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              type='password'/>
          </div>
          <div className='mt-6'>
            <button 
              onClick={()=>{handleForm()}}
              className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
            >Login</button>
          </div>
        </form>
        <p className="mt-8 text-xs font-light text-center text-gray-700">
           {" "}
            Already have an account?{" "}
          <b
            onClick={()=>{navigateTo('/')}}
            className="font-medium text-purple-600 hover:underline cursor-pointer"
          >
              Login
          </b>
        </p>
      </div>
    </div>
  )
}

export default Signup