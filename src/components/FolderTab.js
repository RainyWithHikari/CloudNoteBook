//common
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
//import './TabList.scss'

const FolderTab = ({ folders , activeFolderId ,onFolderTabClick }) => {
  return (
    
    <ul className="nav nav-pills tablist-component">
      {folders.map(folder => {
        const fClassName = classNames({
          'nav-link':true,
          'active': folder.id === activeFolderId,
        })
        
        return (
          <li className="nav-item" key={folder.id}>
            <a 
              href="#"
              className={fClassName}
              onClick={() => {onFolderTabClick(folder.id)}}
            >
              {folder.name}
              
            </a>
          </li>
        )
      })}
    </ul>
  )
}

FolderTab.propTypes = {
    folders: PropTypes.array,
    activeFolderId: PropTypes.string,
    onFolderTabClick:PropTypes.func,
}
// FolderTab.defaultProps = {
//   unsaveIds: []
// }

export default FolderTab