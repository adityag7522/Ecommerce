class ApiFeatures {
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex:this.queryStr.keyword,
                $options: "i"
            }
        } : {};

        this.query = this.query.find({...keyword});
        return this;
    }

    //filter for pricing and rating
    filter(){
        const queryCopy = {...this.queryStr};

        //removing some fields for category
        const removeFields = ["keyword","page","limit"];

        removeFields.forEach(key=>delete queryCopy[key])
        
        let querystr = JSON.stringify(queryCopy);
        querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g,(key) =>`$${key}`);
        

        this.query = this.query.find(JSON.parse(querystr));



        return this;
    }

    pagination(resultPerPage){
        const currPage = Number(this.queryStr.page) || 1;

        const ski = resultPerPage*(currPage-1);

        this.query = this.query.limit(resultPerPage).skip(ski);

        return this;

    }
}

module.exports = ApiFeatures;