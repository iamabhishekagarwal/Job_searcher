import React from 'react'
import { useRecoilValue } from 'recoil'
import { userState } from '../../atoms'

function Home() {
    const user = useRecoilValue(userState)
  return (
    <div className='text-gray-950'>{user.fname}</div>
  )
}

export default Home