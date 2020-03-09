/*
Infinite scroll to load the data in apache arrow format from an api backed by a backend written in python.
*/


import React from 'react'
import {Table} from 'apache-arrow'

class App extends React.Component{
    state={
        data:[],  //data we want to fetch
        start:0,  
        docLength:50,  //current table length
        length:50,
        scrolling:false,
        isLoading:false
    }

    componentDidMount(){
        this.loadData();
        this.scrollListener = window.addEventListener('scroll',(e) => {
            this.handleScroll(e)
        })
    }

    handleScroll = (e) => {
        const {scrolling, start, docLength} = this.state
        if(scrolling) return
        if(docLength <= start) return
        const lastTable = document.querySelector('table.data')
        const lastTableOffset = lastTable.clientHeight
        const pageOffset = window.pageYOffset + window.innerHeight
        var bottomOffset = 100;
        // console.log(pageOffset > lastTableOffset - bottomOffset) **just for debug
        if(pageOffset > lastTableOffset - bottomOffset) this.loadMore()  //keep fetching data while scroll down enough.
    }

    loadData = async () => {
        const {data, length, docLength,start} = this.state
        const url =  `http://localhost:8080/api/read?start=${start}&length=${length}`;
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const dataTable = Table.from(new Uint8Array(arrayBuffer))
        let newdata = [];
        for(var i = 0; i < length; i++){
            newdata.push(dataTable.get(i).toJSON())
        }
        this.setState({
            data:[...data,...newdata],
            scrolling:false,
            docLength:docLength+50
        })
    }

    loadMore = () => {
        this.setState(prevState => ({
            start: prevState.start + 50,
            scrolling: true,
        }), this.loadData)
        // console.log(this.state.start) ** just for debug
    }

    render(){
        return(
            <div>
                <table className="data">
                    <thead>
                        <tr>
                            <th>MSOA code</th>
                            <th>MSOA name</th>
                            <th>Local authority code</th>
                            <th>Local authority name</th>
                            <th>Region code</th>
                            <th>Region name</th>
                            <th>Net annual income</th>
                            <th>Upper confidence limit</th>
                            <th>Lower confidence limit</th>
                            <th>Confidence interval</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.data.map(data=>(
                        <tr key={data['MSOA code']}>
                            <td>{data['MSOA code']}</td>
                            <td>{data['MSOA name']}</td>
                            <td>{data['Local authority code']}</td>
                            <td>{data['Local authority name']}</td>
                            <td>{data['Region code']}</td>
                            <td>{data['Region name']}</td>
                            <td>{data['Net annual income (£)']}</td>
                            <td>{data['Upper confidence limit (£)']}</td>
                            <td>{data['Lower confidence limit (£)']}</td>
                            <td>{data['Confidence interval (£)']}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default App;