//common
import React, { useState, useMemo, memo } from 'react'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/bootstrap-icons.svg'


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faList, faPlus, faFileImport, faSave, faFileExport, faCopy, faFilter, faDiagramSuccessor, faClipboardCheck, faUserCircle } from '@fortawesome/free-solid-svg-icons'

//markdown editor
import SimpleMDE from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"
import * as marked from 'marked'

//uuid
import { v4 as uuidv4 } from 'uuid'
//markmap
import { Transformer } from 'markmap-lib'
import * as markmap from 'markmap-view'

//components
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
import TodoList from './components/TodoList'
import TodoCard from './components/TodoCard'
import SortBadge from './components/SortBadge'
import SortList from './components/SortList'


//utils
import fileHelper from './utils/fileHelper'
import { flattenArr, objToArr } from './utils/helper'
import FileHelper from './utils/fileHelper'



//require node.js modules

const { join, basename, extname, dirname } = window.require('path')
const remote = window.require('@electron/remote')
const Store = window.require('electron-store')
const fileStore = new Store({ 'name': 'Files Data' })
const todoStore = new Store({ 'name': 'todos data' })
const sortStore = new Store({ 'name': 'sorts data' })
const bootstrap = window.require('bootstrap')
const ReactDOM = require('react-dom')
const ReactMarkdown = require('react-markdown')


//use JavaScript to change tabs
var triggerTabList = [].slice.call(document.querySelectorAll('#myTab button'))
triggerTabList.forEach(function (triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)

  triggerEl.addEventListener('click', function (event) {
    event.preventDefault()
    tabTrigger.show()
  })
})
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})


//store Files into local dir
const saveFilesToStore = (files) => {
  //no need to store all the info into the system.
  const fileStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, sort, createdAt } = file//const { id , path , title , createdAt , sort} = file
    result[id] = {
      id,
      path,
      title,
      sort,
      createdAt,

    }
    return result
  }, {})
  fileStore.set('files', fileStoreObj)
}
//store todos into local dir
const saveTodosToStore = (todos) => {
  const todoStoreObj = objToArr(todos).reduce((result, todoEvent) => {
    const { id, path, todo, dueDate, importance, details } = todoEvent
    result[id] = {
      id,
      path,
      todo,
      dueDate,
      importance,
      details,
    }
    return result

  }, {})
  todoStore.set('todos', todoStoreObj)
}
const saveSortsToStore = (sorts) => {
  const sortStoreObj = objToArr(sorts).reduce((result, sortEvent) => {
    const { id, path, sortName, sortDescription } = sortEvent
    result[id] = {
      id,
      path,
      sortName,
      sortDescription,

    }
    return result
  }, {})
  sortStore.set('sorts', sortStoreObj)
}
const closeMindmap = () => {

  const div = document.getElementsByClassName("markmap")[0]
  div.innerHTML = ""
  //div.documentElement.removeChild()
  console.log(div)


}

function App() {

  const transformer = new Transformer();
  const { Markmap, loadCSS, loadJS } = window.markmap;

  //const transformer = new Transformer();
  //const { Markmap, loadCSS, loadJS } = markmap;
  const exec = window.require('child_process').exec

  //setup the state of sort lists
  const [sorts, setSorts] = useState(sortStore.get('sorts') || {})
  const sortArr = objToArr(sorts)
  const [activeSortName, setActiveSortName] = useState('')



  //setup the state of Todo Lists
  const [todos, setTodos] = useState(todoStore.get('todos') || {})
  const [openedTodoIDs, setOpenedTodoIDs] = useState([])
  const [activeTodoID, setActiveTodoID] = useState('')
  const todoArr = objToArr(todos)
  const openedTodos = openedTodoIDs.map(openTodoID => {
    return todos[openTodoID]
  })
  const activeTodo = todos[activeTodoID]

  //setup the state of Files
  const [files, setFiles] = useState(fileStore.get('files') || {})
  const [activeFileID, setActiveFileID] = useState('')
  const [activeMindMapID, setActiveMindMapID] = useState('')
  const [openedFileIDs, setOpenedFileIDs] = useState([])
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
  const [searchedFiles, setSearchedFiles] = useState([])
  const [filteredFiles, setFilteredFiles] = useState([])
  const filesArr = objToArr(files)
  const savedLocation = remote.app.getPath('documents')
  const savedTodoLocation = remote.app.getPath('userData')
  const savedSortLocation = remote.app.getPath('userData')
  const activeFile = files[activeFileID]
  const activeMindMap = files[activeMindMapID]
  //console.log(activeFile.body)
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID]
  })
  const fileListArr = (filteredFiles.length > 0) ? filteredFiles : filesArr

  const SortBadgeClick = (sortName) => {
    setActiveSortName(sortName)
    console.log(activeSortName)
    const sortFiles = filesArr.filter(file => file.sort.includes(sortName))
    setFilteredFiles(sortFiles)
  }
  //use cmd to transform .md file to mindmap file
  const startCMD = () => {
    let cmdStr1 = `npx markmap-cli ${activeFile.path}`//'npx markmap-cli C:\\Users\\anhko\\Documents\\new2.md'//npx markmap-cli C:\Users\anhko\Documents\new2.md
    let cmdPath = ''
    let workerProcess
    runExec(cmdStr1)
    function runExec(cmdStr) {
      workerProcess = exec(cmdStr, { cwd: cmdPath })
      workerProcess.stdout.on('data', function (data) {
        console.log('stdout:' + data)
      })
      workerProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data)
      })
      workerProcess.on('close', function (code) {
        console.log('out code：' + code)
      })
    }
  }
  const generateMindmap = () => {
    const div = document.getElementsByClassName("markmap")[0]
    div.innerHTML = ""
    //setActiveFileID(activeFileID)
    setActiveMindMapID(activeFileID)
    //console.log(activeMindMap.body)
    const { root, features } = transformer.transform(activeMindMap.body);
    //setActiveMindMapID(activeMindMapID)
    console.log(activeMindMapID)
    const { styles, scripts } = transformer.getUsedAssets(features);
    if (styles) loadCSS(styles);
    if (scripts) loadJS(scripts, { getMarkmap: () => window.markmap });
    Markmap.create('.markmap', null, root);
    //setActiveMindMapID('')
  }
  //functions of files
  const fileClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID)
    //setActiveMindMapID(activeFileID)
    setActiveMindMapID(fileID)
    console.log('file click', activeMindMapID)
    const currentFile = files[fileID]
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ...files[fileID], body: value, isLoaded: true }
        setFiles({ ...files, [fileID]: newFile })
      })
    }
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID])
    }
  }
  const fileChange = (id, value) => {

    const newFile = { ...files[id], body: value }
    setFiles({ ...files, [id]: newFile })
    // update unsavedIDs
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }

  }
  const deleteFile = (id, sortName) => {
    if (files[id].isNew) {
      const { [id]: value, ...afterDelete } = files
      setFiles(afterDelete)
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        const { [id]: value, ...afterDelete } = files
        setFiles(afterDelete)
        saveFilesToStore(afterDelete)
        const afterDeleteArr = objToArr(afterDelete)
        const sortFiles = afterDeleteArr.filter(file => file.sort.includes(sortName))
        setFilteredFiles(sortFiles)
        tabClose(id)
      })
    }
  }
  const updateFile = (id, title, sort, isNew) => {
    //信息持久化
    //if inNew is false , path will be old dir + newTitle
    const newPath = isNew ? join(savedLocation, `${title}.md`) : join(dirname(files[id].path), `${title}.md`)
    const modifiedFile = { ...files[id], title: title, sort: sort, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    if (isNew) {
      //判断文件是否存在，如果不存在，新建md文件
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        //数据持久化
        saveFilesToStore(newFiles)
      })
    } else {
      const oldPath = files[id].path
      //如果存在，修改文件名
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        //数据持久化
        saveFilesToStore(newFiles)
      })

    }
  }

  const createNewFile = () => {
    const newID = uuidv4() //通用唯一识别码
    const newFile = {
      id: newID,
      title: '',
      body: '## Markdown',
      sort: '',
      createdAt: new Date().getTime(),
      isNew: true,
    }
    setFiles({ ...files, [newID]: newFile })
  }
  const showAllFiles = () => {
    setFilteredFiles([])
    //setSearchedFiles([])

  }
  const fileSearch = (keyword) => {
    // filter out the new files based on the keyword
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }
  const saveCurrentFile = () => {
    //save files to original path
    FileHelper.writeFile(activeFile.path, activeFile.body).then(() => {
      setUnsavedFileIDs(unsavedFileIDs.filter(id => id != activeFile.id))
    })
  }
  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '请选择导入的Markdown文件',
      filters: [{
        name: 'Markdown',
        extensions: ['md']
      }
      ],
      properties: ['openFile', 'multiSelections'],

    }).then(result => {
      if (Array.isArray(result.filePaths)) {
        //filter out the path we've already opened in app
        const filteredPaths = result.filePaths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => {
            return file.path === path
          })
          return !alreadyAdded
        })
        const importFilesArr = filteredPaths.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path,
            //sort:basename(path , extname(path)),


          }
        })
        //console.log(importFilesArr)
        //get the new files object in flattenArr
        const newFiles = { ...files, ...flattenArr(importFilesArr) }
        //console.log(newFiles)
        //setState and update store
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        if (importFilesArr.length > 0) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: ``,
            message: `You have imported ${importFilesArr.length} files successfully!`,
          })
        }

      }


    })

  }

  //functions of tabs
  const tabClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID)

  }
  const tabClose = (id) => {
    //remove current id from openedFileIDs
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabsWithout)
    // set the active to the first opened tab if still tabs left
    if (tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0])
      setActiveMindMapID(tabsWithout[0])
      console.log('tab close', activeMindMapID)
    } else {
      setActiveFileID('')
      setActiveMindMapID('')
      console.log('tab close', activeMindMapID)
    }
  }



  //functions of todo lists
  const todoClick = (todoID) => {
    setActiveTodoID(todoID)
    if (!openedTodoIDs.includes(todoID)) {
      setOpenedTodoIDs([...openedTodoIDs, todoID])
    }

  }
  const deleteTodo = (id) => {
    if (todos[id].isNew) {
      const { [id]: todo, ...afterDelete } = todos
      setTodos(afterDelete)
    } else {
      fileHelper.deleteFile(todos[id].path).then(() => {
        delete todos[id]
        setTodos(todos)
        saveTodosToStore(todos)
        closeCard(id)
      })

    }
  }
  const updateTodo = (id, dueDate, todoEvent, importance, details, isNew) => {
    const newTodoPath = isNew ? join(savedTodoLocation, `todo-${todoEvent}.log`) : join(dirname(todos[id].path), `todo-${todoEvent}.log`)
    const modifiedTodo = { ...todos[id], dueDate: dueDate, todo: todoEvent, importance: importance, details: details, isNew: false, path: newTodoPath }
    const newTodos = { ...todos, [id]: modifiedTodo }
    if (isNew) {
      fileHelper.writeFile(newTodoPath, '').then(() => {
        setTodos(newTodos)
        saveTodosToStore(newTodos)
      })
    } else {
      const oldTodoPath = todos[id].path
      fileHelper.renameFile(oldTodoPath, newTodoPath).then(() => {
        setTodos(newTodos)
        saveTodosToStore(newTodos)
      })
    }


  }
  const createNewTodo = () => {
    const newTodoID = uuidv4()
    const newTodo = {
      id: newTodoID,
      dueDate: '',
      todo: '',
      importance: '',
      details: '',
      isNew: true,
    }
    setTodos({ ...todos, [newTodoID]: newTodo })
    //saveTodosToStore({ ...todos, [newTodoID]: newTodo })
  }

  //functions of cards
  const closeCard = (id) => {
    const cardsWithout = openedTodoIDs.filter(todoID => todoID !== id)
    setOpenedTodoIDs(cardsWithout)
    if (cardsWithout.length > 0) {
      setActiveTodoID(cardsWithout[0])
    } else {
      setActiveTodoID('')
    }

  }



  const deleteSorts = (id) => {
    if (sorts[id].isNew) {
      const { [id]: sort, ...afterDelete } = sorts
      setSorts(afterDelete)
    } else {
      fileHelper.deleteFile(sorts[id].path).then(() => {

        const { [id]: sort, ...afterDelete } = sorts
        setSorts(afterDelete)
        saveSortsToStore(afterDelete)
      })
    }
  }
  const updateSorts = (id, sortName, sortDescription, isNew) => {
    const newSortPath = isNew ? join(savedSortLocation, `sort-${sortName}.log`) : join(dirname(sorts[id].path), `sort-${sortName}.log`)
    const modifiedSort = { ...sorts[id], sortName: sortName, sortDescription: sortDescription, path: newSortPath, isNew: false }
    const newSorts = { ...sorts, [id]: modifiedSort }

    if (isNew) {
      fileHelper.writeFile(newSortPath, '').then(() => {
        setSorts(newSorts)
        saveSortsToStore(newSorts)
      })

    } else {
      const oldSortPath = sorts[id].path
      fileHelper.renameFile(oldSortPath, newSortPath).then(() => {
        setSorts(newSorts)
        saveSortsToStore(newSorts)
      })

    }

  }
  const createNewSort = () => {
    const newSortID = uuidv4()
    const newSort = {
      id: newSortID,
      sortName: '',
      sortDescription: '',
      isNew: true,
    }
    setSorts({ ...sorts, [newSortID]: newSort })
  }

  return (
    <div className="App">

      <div className='tool-bar'>
        <ul className="nav nav-pills flex-column" id="myTab" role="tablist">
          <li className="nav-item mb-3" role="presentation">
            <button className="nav-link bar active " id="file-tab" data-bs-toggle="tab" data-bs-target="#file" type="button" role="tab" aria-controls="file" aria-selected="true">
              <FontAwesomeIcon
                size="2x"
                icon={faCopy} />
            </button>
          </li>
          <li className="nav-item mb-3" role="presentation">
            <button className="nav-link bar" id="sort-tab" data-bs-toggle="tab" data-bs-target="#sort" type="button" role="tab" aria-controls="sort" aria-selected="false">
              <FontAwesomeIcon
                size="2x"
                icon={faList} />
            </button>
          </li>
          <li className="nav-item mb-3" role="presentation">
            <button className="nav-link bar" id="todoLists-tab" data-bs-toggle="tab" data-bs-target="#todoLists" type="button" role="tab" aria-controls="todoLists" aria-selected="false">
              <FontAwesomeIcon
                size="2x"
                icon={faClipboardCheck} />
            </button>
          </li>
          <li className="nav-item mb-3" role="presentation">
            <button className="nav-link bar" id="mindmaps-tab" data-bs-toggle="tab" data-bs-target="#mindmaps" type="button" role="tab" aria-controls="mindmaps" aria-selected="false"

            >
              <FontAwesomeIcon

                size="2x"
                icon={faDiagramSuccessor} />
            </button>
          </li>

          <li className="nav-item mb-3" role="presentation">
            <button className="nav-link bar" id="todoLists-tab" data-bs-toggle="tab" data-bs-target="#todoLists" type="button" role="tab" aria-controls="todoLists" aria-selected="false">
              <FontAwesomeIcon
                size="2x"
                icon={faUserCircle} />
            </button>
          </li>
        </ul>
      </div>
      <div className='row container-fluid container-father'>
        <div className='col-3 left-panel'>
          <div className="tab-content row">
            <div className="tab-pane active" id="file" role="tabpanel" aria-labelledby="file-tab">
              <div className='row list-title d-flex align-items-center'>
                <span className=' col-6 text-left'><strong>File List</strong></span>
                <FontAwesomeIcon
                  className="col-2 p-0 c-link"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="New File"
                  size="lg"
                  icon={faPlus}
                  onClick={createNewFile} />
                <FontAwesomeIcon
                  className="col-2 p-0 c-link"
                  type='button'
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseSort"
                  aria-expanded="false" aria-controls="collapseSort"
                  //data-bs-placement="bottom"
                  size="lg"
                  icon={faFilter}
                />
                <FontAwesomeIcon
                  className="col-2 p-0 c-link"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Import File"
                  size="lg"
                  icon={faFileImport}
                  onClick={importFiles} />

              </div>
              <div className="col collapse" id="collapseSort">
                <div className='row'>
                  <BottomBtn
                    colorClass='btn-outline-secondary'
                    text='All Files'
                    type='button'
                    icon={faAngleDown}
                    onBtnClick={showAllFiles}>
                  </BottomBtn>
                </div>

                <SortBadge
                  sorts={sortArr}
                  activeSortName={activeSortName}
                  onSortBadgeClick={SortBadgeClick}>
                </SortBadge>
              </div>


              <FileList
                files={fileListArr}
                onFileClick={fileClick}
                onFileDelete={deleteFile}
                onSaveEdit={updateFile}
                sorts={sortArr}
              />



            </div>
            <div className="tab-pane" id="sort" role="tabpanel" aria-labelledby="sort-tab">
              <div className='row list-title d-flex align-items-center'>
                <span className=' col-10 text-left'><strong>Sort Management</strong></span>
                <FontAwesomeIcon
                  className="col-2 p-0 c-link"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="New Sort"
                  size="lg"
                  icon={faPlus}
                  onClick={createNewSort}
                />
              </div>
              <SortList
                sorts={sortArr}
                onSortClick={(id) => { console.log(id) }}
                onSortDelete={deleteSorts}
                onSaveSort={updateSorts}
              >
              </SortList>
            </div>
            <div className="tab-pane" id="mindmaps" role="tabpanel" aria-labelledby="mindmaps-tab">


            </div>
            <div className="tab-pane" id="todoLists" role="tabpanel" aria-labelledby="todoLists-tab">
              <div className='row list-title d-flex align-items-center'>
                <span className=' col-10 text-left'><strong>Todo List</strong></span>
                <FontAwesomeIcon
                  className="col-2 p-0 c-link"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="New Todo"
                  size="lg"
                  icon={faPlus}
                  onClick={createNewTodo}
                />

              </div>

              <TodoList
                todos={todoArr}
                onEventClick={todoClick}
                onEventDelete={deleteTodo}
                onSaveEvent={updateTodo}
              >
              </TodoList>
              {
                !activeTodo &&
                <>
                  <div className="card text-center " hidden>
                  </div>

                </>
              }
              {
                activeTodo &&
                <>
                  <TodoCard
                    todos={openedTodos}
                    activeID={activeTodo}
                    onCloseCard={closeCard}>
                  </TodoCard>
                </>
              }

            </div>
          </div>
        </div>
        <div className='main col-9 right-panel p-0'>
          {
            !activeFile &&
            <div className="start-page">
              Choose/Import a Markdown File.
            </div>
          }
          {
            activeFile &&
            <>


              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}

              />


              <SimpleMDE
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                
                onChange={(value) => { fileChange(activeFile.id, value) }}
                options={{
                  autoDownloadFontAwesome: true,
                  autofocus: true,
                  forceSync: false,
                  previewImagesInEditor: true,
                  //lineNumbers: true,
                  minHeight: '780px',
                  uploadImage: true,

                  previewRender: (plainText) => marked.parse(plainText),
                  showIcons: ['strikethrough', 'code', 'table', 'redo', 'heading', 'undo', 'heading-bigger', 'heading-smaller', 'heading-1', 'heading-2', 'heading-3', 'clean-block', 'horizontal-rule'],

                }}
              >
              </SimpleMDE>

              <BottomBtn
                className="col"
                text="Save Change"
                colorClass="btn-outline-secondary"
                icon={faSave}
                onBtnClick={saveCurrentFile}
              />
              <button className="btn btn-outline-secondary no-border" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasScrolling" aria-controls="offcanvasScrolling" >Show Mindmap</button>
              <div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id="offcanvasScrolling" aria-labelledby="offcanvasScrollingLabel" >
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="offcanvasScrollingLabel">{activeFile.title}</h5>
                  
                  <button className='btn btn-outline-secondary no-border'onClick={generateMindmap} > Update </button>

                  <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" ></button>
                </div>
                <div className="offcanvas-body">
                  
                  <svg className='markmap'></svg>
                </div>
              </div>
              <BottomBtn
                className="col"
                text="Export Mindmap"
                colorClass="btn-outline-secondary"
                icon={faFileExport}
                onBtnClick={startCMD}
              />
            </>
          }
        </div>
      </div>

    </div>

  );
}

export default App;
