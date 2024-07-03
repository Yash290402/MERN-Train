async function submitform() {

    // getelement and store variables
    const username = document.getElementById("username");
    console.log(username);

    try {
        const response = await fetch('http://localhost::5500/api/v1/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ username }),
        })


        if (!response.ok) {
            error
        }


        alert('thank you for your feedback')
    } catch (error) {
    
    }
}



document.getElementById('').addEventListener('click', (e) => {
    e.preventDefault();
    submitform()
})