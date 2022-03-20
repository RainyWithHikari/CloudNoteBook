import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import useKeyPress from "../Hook/useKeyPress";
import "./FileSearch.scss"


const FileSearch = ({ title, onFileSearch }) => {
    const [inputActive, setInputActive] = useState(false)
    const [searchValue, setSearchValue] = useState('');
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    let node = useRef(null);



    const closeSearch = () => {
        setInputActive(false);
        setSearchValue('');
        onFileSearch('')
       
    }

    useEffect(() => {
        if (enterPressed && inputActive) {
            onFileSearch(searchValue)
        }
        if (escPressed && inputActive) {
            closeSearch()
        }
    })

    useEffect(() => {
        if (inputActive) {
            node.current.focus()

        }

    }, [inputActive])
    return (
        <div className="row">
            {
                <div className="search-bar p-2 text-dark bg-opacity-10 d-flex  align-items-center mb-0">
                    {
                        !inputActive &&
                        <>
                            <button
                                type="button"
                                className="icon-button col"
                                onClick={() => { setInputActive(true) }}
                            >
                                <FontAwesomeIcon
                                    size="lg"
                                    icon={faMagnifyingGlass} />

                            </button>
                        </>




                    }

                    {
                        inputActive &&
                        <>
                            <input
                                className="form-control"
                                value={searchValue}
                                ref={node}
                                onChange={(e) => { setSearchValue(e.target.value) }}
                            />
                            <button
                                type="button"
                                className="btn-close ms-2"
                                aria-label="Close"
                                onClick={closeSearch}
                            >

                            </button>

                        </>


                    }
                </div>
            }

        </div>
    )
}
FileSearch.propTypes = {
    onFileSearch: PropTypes.func.isRequired,
}
export default FileSearch;