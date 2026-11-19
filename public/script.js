
const API = '/books';

const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');
const message = document.getElementById('message');

// Display messages
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? 'red' : 'green';
}

// Get all books
async function getBooks() {
    try {
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error('Unable to retrieve books');
        }

        const books = await response.json();

        bookList.innerHTML = '';

        books.forEach(book => {
            const row = document.createElement('tr');

            [book.id, book.title, book.author, book.price]
                .forEach(value => {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.appendChild(cell);
                });

            const actions = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.onclick = () => editBook(book.id);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete';
            deleteButton.onclick = () => deleteBook(book.id);

            actions.append(editButton, deleteButton);
            row.appendChild(actions);

            bookList.appendChild(row);
        });

    } catch (error) {
        showMessage(error.message, true);
    }
}

// Add or update book
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('bookId').value;

    const book = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        price: Number(document.getElementById('price').value)
    };

    if (!book.title || !book.author ||
        !Number.isFinite(book.price) || book.price < 0) {
        showMessage('Please enter valid details', true);
        return;
    }

    try {
        const response = await fetch(
            id ? `${API}/${id}` : API,
            {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(book)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        showMessage(result.message);
        resetForm();
        getBooks();

    } catch (error) {
        showMessage(error.message, true);
    }
});

// Edit book
async function editBook(id) {
    try {
        const response = await fetch(`${API}/${id}`);

        if (!response.ok) {
            throw new Error('Book not found');
        }

        const book = await response.json();

        document.getElementById('bookId').value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('price').value = book.price;

        document.getElementById('submitBtn').textContent =
            'Update Book';

    } catch (error) {
        showMessage(error.message, true);
    }
}

// Delete book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        const response = await fetch(`${API}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        showMessage(result.message);
        getBooks();

    } catch (error) {
        showMessage(error.message, true);
    }
}

// Reset form
function resetForm() {
    bookForm.reset();
    document.getElementById('bookId').value = '';
    document.getElementById('submitBtn').textContent = 'Add Book';
}

// Load books when page opens
getBooks();
