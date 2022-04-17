import React from 'react'
import './Loader.scss'

const Loader = ({ text = '处理中'}) => (
  <div className="loading-component text-center">
    <div className="spinner-border text-secondary" role="status">
      <span className="sr-only">{text}</span>
    </div>
    <h5 className="text-secondary">{text}</h5>
  </div>
)

export default Loader
