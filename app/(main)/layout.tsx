import React from "react"

type AuthLayoutProps = {
    children : React.ReactNode;
}

const MainLayout = ({children} : AuthLayoutProps) => {
  return (
    <div className="container mx-auto mt-24 mb-20">{children}</div>
  )
}

export default MainLayout