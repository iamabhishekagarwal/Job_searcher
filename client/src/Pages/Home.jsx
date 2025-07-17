import React from 'react'
import { useRecoilValue } from 'recoil'
import { userState } from '../../atoms'

function Home() {
    const user = useRecoilValue(userState)
  return (
    
<div className='text-gray-950 border border-red-500 p-4'>
  {user.fname}
</div>)
    
}

export default Home