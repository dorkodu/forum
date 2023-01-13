function Welcome() {

  const login = () => {
    document.location.href = `http://id.dorkodu.com/access?service=cherno.dorkodu.com`;
  }

  return (
    <>
      welcome
      <br />
      <button onClick={login}>login with dorkodu id</button>
    </>
  )
}

export default Welcome