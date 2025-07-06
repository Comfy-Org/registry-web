import React from 'react'
import DrHeader from './DrHeader'
import DrCard from './DrCard'
const cardData = [
  {
    title: 'NodesOrg 1',
    createdDate: '5/20/24',
    members: ['Robin Huang', 'Yoland Yan'],
  },
  {
    title: 'NodesOrg 2',
    createdDate: '5/21/24',
    members: ['John Doe', 'Jane Smith'],
  },
  {
    title: 'NodesOrg 3',
    createdDate: '5/22/24',
    members: ['Alice Johnson', 'Bob Anderson'],
  },
  {
    title: 'NodesOrg 4',
    createdDate: '5/23/24',
    members: ['Ella Parker', 'Tom Wilson'],
  },
]

const DeveloperRegister = () => {
  return (
    <section className="h-full mt-8 bg-gray-900 lg:mt-20">
      <DrHeader />
      <div className="grid gap-4 mb-6 lg:mb-2 lg:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
        {cardData.map((member, index) => (
          <DrCard key={index} {...member} />
        ))}
      </div>
    </section>
  )
}

export default DeveloperRegister
