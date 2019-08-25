interface IRecordInformation{
    id:string,
    name:string
    absoluteUrl: string
    siteUrl: string,
    date:string,
    user:string,
    ext:string,
    selected?:boolean
    isCheckOut?:boolean
}

export default IRecordInformation;