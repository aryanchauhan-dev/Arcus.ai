
type Params = {
    params : Promise<{id: string}>;
}
const CoverLetter = async({params}: Params) => {
  const { id } = await params;
  return (
    <div> CoverLetter</div>
  )
}

export default CoverLetter;