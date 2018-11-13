import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import {
    selectSubreddit, 
    fetchPostsIfNeeded,
    invalidateSubreddit
} from "../actions"
import Picker from "../components/Picker"
import Posts from "../components/Posts"

class AsyncApp extends Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.handleRefreshClick = this.handleRefreshClick.bind(this)
    }

    /** Dispatch actions after the component has render */
    componentDidMount() {
        const { dispatch, selectedSubreddit } = this.props
        dispatch(fetchPostsIfNeeded(selectedSubreddit))
        console.log(`AsyncApp componentDidMount, selectedSubreddit: ${selectedSubreddit}`)
    }

    /** Checks if the component need to update the posts if the selected subreddit has changed */
    componentDidUpdate(prevProps) {
        if(this.props.selectedSubreddit !== prevProps.selectedSubreddit) {
            const { dispatch, selectedSubreddit } = this.props
            dispatch(fetchPostsIfNeeded(selectedSubreddit))
            console.log(`AsyncApp componentDidUpdate, selectedSubreddit: ${selectedSubreddit}`)
        }
    }

    handleChange(nextSubreddit) {
        console.log(`AsyncApp handleChange, selectedSubreddit: ${nextSubreddit}`)
        this.props.dispatch(selectSubreddit(nextSubreddit))
        this.props.dispatch(fetchPostsIfNeeded(nextSubreddit))
    }

    handleRefreshClick(e) {
        e.preventDefault()

        const { dispatch, selectedSubreddit } = this.props
        console.log(`AsyncApp handleRefreshClick, selectedSubreddit: ${selectedSubreddit}`)

        dispatch(invalidateSubreddit(selectedSubreddit))
        dispatch(fetchPostsIfNeeded(selectedSubreddit))
    }

    render() {
        const { selectedSubreddit, posts, isFetching, lastUpdated } = this.props
        return (
            <div>
                <Picker
                    value={selectedSubreddit}
                    onChange={this.handleChange}
                    options={["reactjs", "frontend"]}
                />
                <p>
                    { lastUpdated && ( 
                    <span>
                        Last updated at { new Date(lastUpdated).toLocaleTimeString }.{' '}
                    </span> 
                    ) }
                    { !isFetching && (
                        <button onClick={this.handleRefreshClick}>Refresh</button>
                    ) }
                </p>
                {isFetching && posts.length === 0 && <h2> Loading...</h2>} 
                {!isFetching && posts.length === 0 && <h2>Empty</h2>}
                {
                    posts.length > 0 && (
                        <div style={{opacity: isFetching ? 0.5 :1}}>
                            <Posts posts={posts} />
                        </div>
                    )
                }
            </div>
        )
    }
}

AsyncApp.propTypes = {
    selectedSubreddit: PropTypes.string.isRequired,
    posts: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
    dispatch: PropTypes.func.isRequired

}

function mapStateToProps(state) {
    const { selectedSubreddit, postsBySubreddit } = state
    console.log(`AsyncApp mapStateToProps, selectedSubreddit: ${selectedSubreddit}`)
    const { isFetching, lastUpdated, items: posts } = postsBySubreddit[selectedSubreddit] 
        || { isFetching: true, items: [] }

        return { selectedSubreddit, posts, isFetching, lastUpdated }
}

export default connect(mapStateToProps)(AsyncApp)

