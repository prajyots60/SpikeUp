import React from 'react'
import OnBoarding from './_components/OnBoarding'

type Props = {}

const Page = (props: Props) => {
  return (
    <div className='w-full mx-auto h-full'>
      <div className='w-full flex flex-col sm:flex-row justify-between items-start gap-14'>
        <div className='space-y-6'>
          <h2 className='text-primary font-semibold text-4xl'>
            Get maximum conversion from your webinars
          </h2>
          <OnBoarding />

        </div>
      </div>
    </div>
  )
}

export default Page