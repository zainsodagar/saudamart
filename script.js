
        document.getElementById('current-date').textContent = new Date().toLocaleDateString();

        function handlePaymentChange() {
            const paymentMode = document.getElementById('payment-mode').value;
            const creditOptions = document.getElementById('credit-options');
            creditOptions.style.display = paymentMode === 'credit' ? 'block' : 'none';
        }

        function updatePreviousBalance() {
            const shopName = document.getElementById('shop-name').value.trim();
            fetch('BALANCE.json')
                .then(response => response.json())
                .then(data => {
                    const previousBalance = data[shopName]?.previousBalance;
                    document.getElementById('previousBalanceDisplay').innerHTML = `Previous Balance: Rs.${previousBalance !== undefined ? previousBalance : 0}`;
                })
                .catch(error => console.error('Error loading balance data:', error));
        }

        document.getElementById('shop-name').addEventListener('change', updatePreviousBalance);
        window.onload = function() {
            updatePreviousBalance();
        };

        function searchTable() {
            let input = document.getElementById('searchBar').value.toUpperCase();
            let table = document.getElementById('productTable');
            let tr = table.getElementsByTagName('tr');

            for (let i = 1; i < tr.length; i++) {
                let td = tr[i].getElementsByTagName('td')[1];
                if (td) {
                    let txtValue = td.textContent || td.innerText;
                    tr[i].style.display = txtValue.toUpperCase().indexOf(input) > -1 ? '' : 'none';
                }
            }
        }

        let updatedProducts = [];
        let selectedRowIndex = null;

        document.getElementById('loadDataBtn').addEventListener('click', function() {
            fetch('PRODUCTS.json')
                .then(response => response.json())
                .then(data => {
                    const tableBody = document.querySelector('#productTable tbody');
                    tableBody.innerHTML = '';
                    updatedProducts = data;

                    data.forEach((product, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${product.ProductID}</td>
                            <td>${product.ProductName}</td>
                            <td>${product.RetailPrice}</td>
                            <td contenteditable="true" onblur="updateOfferPrice(this, ${index})">${product.OfferPrice}</td>
                        `;

                        row.addEventListener('click', function() {
                            const rows = document.querySelectorAll('#productTable tbody tr');
                            rows.forEach(row => row.classList.remove('table-active'));
                            row.classList.add('table-active');
                            selectedRowIndex = index;
                        });

                        tableBody.appendChild(row);
                    });
                })
                .catch(error => console.error('Error loading data:', error));
        });

        function updateOfferPrice(cell, index) {
    // Check if the input already exists to prevent creating multiple inputs
    if (cell.querySelector('input')) return;

    // Create a new input element
    const input = document.createElement('input');
    input.type = 'number'; // Set the input type to number
    input.value = cell.innerText; // Set the current value
    input.style.width = '100%'; // Optional: make the input take full width
    input.style.border = 'none'; // Optional: remove border for better appearance
    input.style.outline = 'none'; // Optional: remove outline for better appearance
    cell.innerHTML = ''; // Clear the cell content
    cell.appendChild(input); // Append the input to the cell

    // Focus on the input after a short delay to ensure the keyboard appears
    setTimeout(() => {
        input.focus(); // Focus on the input to show the keyboard
    }, 0);

    // Handle the blur event to save the value
    input.onblur = function() {
        updatedProducts[index].OfferPrice = input.value; // Update the OfferPrice
        cell.innerHTML = input.value; // Replace the input with the updated value
    };

    // Optional: Handle the Enter key to save the value
    // input.onkeydown = function(event) {
    //     if (event.key === 'Enter') {
    //         input.blur(); // Trigger blur to save the value
    //     }
    // };

    // // Optional: Handle the Escape key to cancel editing
    // input.onkeydown = function(event) {
    //     if (event.key === 'Escape') {
    //         cell.innerHTML = input.value; // Revert to original value
    //     }
    // };
}

        function applyQuantity() {
    const qtyInput = document.getElementById('qtyInput');
    const qtyValue = parseInt(qtyInput.value);

    if (selectedRowIndex === null) {
        alert('Please select a product row first.');
        return;
    }

    if (isNaN(qtyValue) || qtyValue <= 0) {
        alert('Please enter a valid quantity.');
        return;
    }

    const row = document.querySelector(`#productTable tbody tr:nth-child(${selectedRowIndex + 1})`);
    
    // Set the quantity directly to the new value
    row.setAttribute('data-qty', qtyValue);

    // Store quantity in data attribute
    // let currentQty = parseInt(row.getAttribute('data-qty')) || 0;
    // let newQty = currentQty + qtyValue;
    // row.setAttribute('data-qty', newQty);

    // Update the product name with a badge and dustbin icon
    const productNameCell = row.cells[1];
    let qtyBadge = productNameCell.querySelector('.qty-badge');
    let dustbinIcon = productNameCell.querySelector('.qty-dustbin');

    // Update or create the quantity badge
    if (qtyBadge) {
        qtyBadge.textContent = qtyValue; // Update existing badge
    } else {
        qtyBadge = document.createElement('span');
        qtyBadge.className = 'qty-badge';
        qtyBadge.textContent = qtyValue;

        // Create the dustbin icon
        dustbinIcon = document.createElement('i');
        dustbinIcon.className = 'fas fa-trash-alt qty-dustbin';
        dustbinIcon.style.color = 'red';
        dustbinIcon.style.cursor = 'pointer';
        
        // Add click event to the dustbin icon
        dustbinIcon.onclick = function() {
            // Reset quantity
            row.setAttribute('data-qty', 0);
            qtyBadge.remove();
            dustbinIcon.remove();
        
        };
        productNameCell.appendChild(qtyBadge);
        productNameCell.appendChild(dustbinIcon);
    }

    qtyInput.value = '';
}


       // Function to handle preview
       function previewTable() {
    let table = document.getElementById('productTable');
    let tr = table.getElementsByTagName('tr');
    let previewWindow = window.open('', '', 'width=800,height=600');

    let shopName = document.getElementById('shop-name').value;
    let paymentMode = document.getElementById('payment-mode').value;
    let creditType = paymentMode === 'credit' ? document.getElementById('credit-type').value : 'N/A';
    let previousBalance = document.getElementById('previousBalanceDisplay').textContent;
    let currentDate = new Date().toLocaleDateString();

    previewWindow.document.write(`<h2>${currentDate} - ${shopName} - ${paymentMode} - ${creditType} - Previous Balance: Rs.${previousBalance}</h2>`);
    previewWindow.document.write('<table border="1" cellpadding="5" cellspacing="0">');
    previewWindow.document.write('<tr><th>Product ID</th><th>Product Name</th><th>Quantity</th><th>Retail Price</th><th>Offer Price</th><th>Total Amount</th></tr>');

    let grandTotal = 0;

    for (let i = 1; i < tr.length; i++) {
        let row = tr[i];
        let qtyValue = parseInt(row.getAttribute('data-qty')) || 0;  // Fetch quantity from data attribute

        if (qtyValue > 0) {
            let productId = row.cells[0].textContent;
            let productName = row.cells[1].childNodes[0].textContent.trim();  // Extract product name
            let retailPrice = parseFloat(row.cells[2].textContent) || 0;
            let offerPrice = parseFloat(row.cells[3].textContent) || 0;
            let totalAmount = qtyValue * offerPrice;
            grandTotal += totalAmount;

            previewWindow.document.write(`<tr>
                <td>${productId}</td>
                <td>${productName}</td>
                <td>${qtyValue}</td>
                <td>Rs. ${retailPrice.toFixed(2)}</td>
                <td>Rs. ${offerPrice.toFixed(2)}</td>
                <td>Rs. ${totalAmount.toFixed(2)}</td>
            </tr>`);
        }
    }

    previewWindow.document.write(`<tr><td colspan="5" style="text-align: right;">Grand Total</td><td>Rs. ${grandTotal.toFixed(0)}</td></tr>`);
    previewWindow.document.write('</table>');
    previewWindow.document.close();
}






// Function to handle WhatsApp message
function sendWhatsApp() {
    let shopName = document.getElementById('shop-name').value;
    let paymentMode = document.getElementById('payment-mode').value;
    let creditType = paymentMode === 'credit' ? document.getElementById('credit-type').value : 'N/A';
    let previousBalance = document.getElementById('previousBalanceDisplay').textContent;
    let table = document.getElementById('productTable');
    let tr = table.getElementsByTagName('tr');

    let message = `Order Details\nShop: ${shopName}\nPayment: ${paymentMode} - ${creditType}\nPrevious Balance: ${previousBalance}\n\nProducts:\n`;

    let grandTotal = 0;

    for (let i = 1; i < tr.length; i++) {
        let row = tr[i];
        let qtyValue = parseInt(row.getAttribute('data-qty')) || 0;

        if (qtyValue > 0) {
            let productName = row.cells[1].childNodes[0].textContent.trim();  // Extract product name
            let offerPrice = parseFloat(row.cells[3].textContent) || 0;
            let totalAmount = qtyValue * offerPrice;
            grandTotal += totalAmount;

            message += `${productName} - Qty: ${qtyValue}, Total: Rs.${totalAmount.toFixed(2)}\n`;
        }
    }

    message += `\nGrand Total: Rs.${grandTotal.toFixed(0)}`;

    let whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}





// Function to generate PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let shopName = document.getElementById('shop-name').value;
    let paymentMode = document.getElementById('payment-mode').value;
    let creditType = paymentMode === 'credit' ? document.getElementById('credit-type').value : 'N/A';
    let previousBalance = document.getElementById('previousBalanceDisplay').textContent;
    let currentDate = new Date().toLocaleDateString();

    let fileName = `${currentDate} - ${shopName}.pdf`;

    doc.setFontSize(12);
    doc.text(`Sauda Mart`, 90, 10);
    doc.text(`Date: ${currentDate}`, 10, 20);
    doc.text(`Shop: ${shopName}`, 10, 30);
    doc.text(`Payment mode and type: ${paymentMode} and ${creditType}`, 10, 40);
    doc.text(`Previous Balance: ${previousBalance}`, 10, 50);

    let tableData = [];
    let grandTotal = 0;
    let table = document.getElementById('productTable');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let row = tr[i];
        let qtyValue = parseInt(row.getAttribute('data-qty')) || 0;

        if (qtyValue > 0) {
            let productName = row.cells[1].childNodes[0].textContent.trim();
            let retailPrice = parseFloat(row.cells[2].textContent) || 0;
            let offerPrice = parseFloat(row.cells[3].textContent) || 0;
            let totalAmount = qtyValue * offerPrice;
            grandTotal += totalAmount;

            tableData.push([
                row.cells[0].textContent,      // Product ID
                productName,                   // Product Name
                qtyValue,                      // Quantity
                retailPrice.toFixed(2),         // Retail Price
                offerPrice.toFixed(2),          // Offer Price
                totalAmount.toFixed(2)          // Total Amount
            ]);
        }
    }

    doc.autoTable({
        startY: 60,
        head: [['Product ID', 'Product Name', 'Quantity', 'Retail Price', 'Offer Price', 'Total Amount']],
        body: tableData,
        columnStyles: {
            2: { halign: 'right' },  // Order Quantity column
            3: { halign: 'right' },  // Retail Price column
            4: { halign: 'right' },  // Offer Price column
            5: { halign: 'right' }   // Total Amount column
        }

    });

    doc.text(`Grand Total: Rs.${grandTotal.toFixed(0)}`, 152.5, doc.lastAutoTable.finalY + 10);

    doc.save(fileName);
}


