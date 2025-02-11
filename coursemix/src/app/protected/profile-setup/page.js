'use client'

import React from 'react'
import NewProfileSetup from '@/components/NewProfileSetup'
import RequireAuth from '@/components/RequireAuth'
import Spinner from '@/components/Spinner'

const NewProfileSetupPage = () => {
  return (
    <RequireAuth>
      <NewProfileSetup />
    </RequireAuth>
  )
}

export default NewProfileSetupPage