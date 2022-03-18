import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import BottomBtn from './BottomBtn'
import useKeyPress from "../Hook/useKeyPress"
import 'bootstrap/dist/css/bootstrap.min.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'


const TodoCard = ({ todos, activeID, onCloseCard }) => {
    return (
        <div className="card text-center">
            {todos.map(todo => {
                const fClassName = classNames({
                    'card-body':true,
                    'active':todo.id === activeID
                })
                return (
                    <div  className="card-body" key={todo.id}>
                        <h5 className="card-title">{todo.todo}</h5>
                        <p className="card-text"><strong>Due Date: </strong>{todo.dueDate}</p>
                        
                        <p className="card-text"><strong>Urgency: </strong>{todo.importance}</p>
                        <p className="card-text"><strong>Details: </strong>{todo.details}</p>
                        <BottomBtn
                            className=""
                            text="Close"
                            icon={faTimes}

                            colorClass="btn-outline-secondary"

                            onBtnClick={(e) => { e.preventDefault(); onCloseCard(todo.id) }}
                        />
                    </div>

                )
            })}

        </div>

    )
}
TodoCard.propTypes = {
    todos: PropTypes.array,
    activeID: PropTypes.object,
    onCloseCard: PropTypes.func,
}
export default TodoCard