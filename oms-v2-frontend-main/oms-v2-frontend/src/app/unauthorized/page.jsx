import Link from 'next/link';
import React from 'react'

export const metadata = {
  title: "Unauthorized Access",
  description: "You do not have permission to access this page.",
};

const unauthorized = () => {
  return (
    <div className="boxShadow px-10 w-full flex items-center flex-col justify-center py-20  min-h-screen">
      <h1 className='text-[#fff] text-[1.2rem] w-full lg:w-[55%] text-center'>Unauthorized Access</h1>
      <p>You do not have permission to access this page.</p>
      <p className='mt-2'><Link href="/" className='btn btn-primary'>Go back to Home</Link></p>
    </div>
  )
}

export default unauthorized
