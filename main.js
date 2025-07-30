// PaySplitz - Main Application Logic
class PaySplitz {
    constructor() {
        this.friends = JSON.parse(localStorage.getItem('friends')) || [];
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        this.init();
    }

    init() {
        this.renderFriends();
        this.renderExpenses();
        this.renderBalances();
        this.updatePaidByOptions();
        this.updateSplitOptions();
    }

    // Friend Management
    addFriend(name, phone) {
        if (!name.trim()) {
            this.showToast('Please enter a friend\'s name', 'error');
            return;
        }

        if (this.friends.find(friend => friend.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('Friend already exists', 'error');
            return;
        }

        const friend = {
            id: Date.now(),
            name: name.trim(),
            phone: phone.trim(),
            addedAt: new Date().toISOString()
        };

        this.friends.push(friend);
        this.saveFriends();
        this.renderFriends();
        this.updatePaidByOptions();
        this.updateSplitOptions();
        this.showToast(`${name} added successfully!`);
    }

    removeFriend(id) {
        if (confirm('Are you sure you want to remove this friend?')) {
            this.friends = this.friends.filter(friend => friend.id !== id);
            this.saveFriends();
            this.renderFriends();
            this.updatePaidByOptions();
            this.updateSplitOptions();
            this.renderBalances();
            this.showToast('Friend removed successfully!');
        }
    }

    // Expense Management
    addExpense(description, amount, paidBy, splitBetween) {
        if (!description.trim() || !amount || !paidBy || splitBetween.length === 0) {
            this.showToast('Please fill all fields and select people to split between', 'error');
            return;
        }

        const expense = {
            id: Date.now(),
            description: description.trim(),
            amount: parseFloat(amount),
            paidBy: paidBy,
            splitBetween: splitBetween,
            amountPerPerson: parseFloat(amount) / splitBetween.length,
            addedAt: new Date().toISOString()
        };

        this.expenses.push(expense);
        this.saveExpenses();
        this.renderExpenses();
        this.renderBalances();
        this.showToast('Expense added successfully!');
        
        // Clear form
        document.getElementById('expenseDescription').value = '';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expensePaidBy').value = '';
        this.updateSplitOptions();
    }

    removeExpense(id) {
        if (confirm('Are you sure you want to remove this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveExpenses();
            this.renderExpenses();
            this.renderBalances();
            this.showToast('Expense removed successfully!');
        }
    }

    // Balance Calculations
    calculateBalances() {
        const balances = {};
        
        // Initialize balances for all friends
        this.friends.forEach(friend => {
            balances[friend.name] = 0;
        });

        // Calculate balances from expenses
        this.expenses.forEach(expense => {
            const paidByName = this.friends.find(f => f.id == expense.paidBy)?.name;
            if (!paidByName) return;

            // Person who paid gets credited
            balances[paidByName] += expense.amount;

            // Everyone who's part of the split gets debited
            expense.splitBetween.forEach(friendId => {
                const friendName = this.friends.find(f => f.id == friendId)?.name;
                if (friendName) {
                    balances[friendName] -= expense.amountPerPerson;
                }
            });
        });

        return balances;
    }

    // Rendering Methods
    renderFriends() {
        const friendsList = document.getElementById('friendsList');
        if (this.friends.length === 0) {
            friendsList.innerHTML = '<p class="text-gray-500 text-center py-4">No friends added yet</p>';
            return;
        }

        friendsList.innerHTML = this.friends.map(friend => `
            <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div class="flex items-center">
                    <div class="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                        ${friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="ml-3">
                        <p class="font-medium text-gray-800">${friend.name}</p>
                        ${friend.phone ? `<p class="text-sm text-gray-600">${friend.phone}</p>` : ''}
                    </div>
                </div>
                <button 
                    onclick="app.removeFriend(${friend.id})" 
                    class="text-red-500 hover:text-red-700 transition-colors"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    renderExpenses() {
        const expensesList = document.getElementById('expensesList');
        if (this.expenses.length === 0) {
            expensesList.innerHTML = '<p class="text-gray-500 text-center py-4">No expenses added yet</p>';
            return;
        }

        expensesList.innerHTML = this.expenses.slice(-10).reverse().map(expense => {
            const paidBy = this.friends.find(f => f.id == expense.paidBy);
            const splitNames = expense.splitBetween.map(id => 
                this.friends.find(f => f.id == id)?.name
            ).filter(Boolean);

            return `
                <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-medium text-gray-800">${expense.description}</h4>
                        <button 
                            onclick="app.removeExpense(${expense.id})" 
                            class="text-red-500 hover:text-red-700 transition-colors text-sm"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <p class="text-lg font-semibold text-purple-600">₹${expense.amount.toFixed(2)}</p>
                    <p class="text-sm text-gray-600">Paid by: ${paidBy?.name || 'Unknown'}</p>
                    <p class="text-sm text-gray-600">Split between: ${splitNames.join(', ')}</p>
                    <p class="text-xs text-gray-500 mt-2">${new Date(expense.addedAt).toLocaleDateString()}</p>
                </div>
            `;
        }).join('');
    }

    renderBalances() {
        const balancesList = document.getElementById('balancesList');
        const balances = this.calculateBalances();
        
        if (Object.keys(balances).length === 0) {
            balancesList.innerHTML = '<p class="text-gray-500 text-center py-4">No balances to show</p>';
            return;
        }

        balancesList.innerHTML = Object.entries(balances).map(([name, balance]) => {
            const isPositive = balance > 0;
            const isZero = Math.abs(balance) < 0.01;
            
            if (isZero) {
                return `
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <span class="font-medium text-gray-800">${name}</span>
                        <span class="text-green-600 font-semibold">Settled ✓</span>
                    </div>
                `;
            }

            return `
                <div class="flex items-center justify-between p-3 ${isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-lg border">
                    <span class="font-medium text-gray-800">${name}</span>
                    <div class="flex items-center space-x-2">
                        <span class="${isPositive ? 'text-green-600' : 'text-red-600'} font-semibold">
                            ${isPositive ? '+' : ''}₹${Math.abs(balance).toFixed(2)}
                        </span>
                        ${!isPositive ? `
                            <button 
                                onclick="app.openSettlementModal('${name}', ${Math.abs(balance)})" 
                                class="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors"
                            >
                                Settle
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    updatePaidByOptions() {
        const select = document.getElementById('expensePaidBy');
        select.innerHTML = '<option value="">Who paid?</option>' + 
            this.friends.map(friend => 
                `<option value="${friend.id}">${friend.name}</option>`
            ).join('');
    }

    updateSplitOptions() {
        const container = document.getElementById('splitOptions');
        if (this.friends.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Add friends first</p>';
            return;
        }

        container.innerHTML = this.friends.map(friend => `
            <label class="flex items-center">
                <input 
                    type="checkbox" 
                    value="${friend.id}" 
                    class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                >
                <span class="ml-2 text-gray-700">${friend.name}</span>
            </label>
        `).join('');
    }

    // Settlement Modal
    openSettlementModal(debtorName, amount) {
        const modal = document.getElementById('settlementModal');
        const details = document.getElementById('settlementDetails');
        
        // Find who the debtor owes money to
        const balances = this.calculateBalances();
        const creditors = Object.entries(balances)
            .filter(([name, balance]) => balance > 0)
            .sort((a, b) => b[1] - a[1]);
        
        if (creditors.length === 0) {
            this.showToast('No one to pay to!', 'error');
            return;
        }

        const primaryCreditor = creditors[0];
        const creditorPhone = this.friends.find(f => f.name === primaryCreditor[0])?.phone;

        details.innerHTML = `
            <div class="text-center">
                <div class="bg-red-50 p-4 rounded-lg mb-4">
                    <p class="text-lg font-semibold text-gray-800">${debtorName} owes</p>
                    <p class="text-3xl font-bold text-red-600">₹${amount.toFixed(2)}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-600">Pay to:</p>
                    <p class="text-lg font-semibold text-gray-800">${primaryCreditor[0]}</p>
                    ${creditorPhone ? `<p class="text-sm text-gray-600">${creditorPhone}</p>` : ''}
                </div>
            </div>
        `;

        // Set up UPI payment
        const payButton = document.getElementById('payWithUPI');
        payButton.onclick = () => this.initiateUPIPayment(creditorPhone, amount, debtorName, primaryCreditor[0]);

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    closeSettlementModal() {
        const modal = document.getElementById('settlementModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    // UPI Payment Integration
    initiateUPIPayment(phone, amount, from, to) {
        if (!phone) {
            this.showToast('No phone number available for UPI payment', 'error');
            return;
        }

        // Create UPI payment URL
        const upiId = `${phone}@paytm`; // You can modify this based on preferred UPI app
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(to)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`PaySplitz Settlement from ${from}`)}`;

        // Try to open UPI app
        const link = document.createElement('a');
        link.href = upiUrl;
        link.click();

        // Show confirmation dialog
        setTimeout(() => {
            if (confirm('Did you complete the payment successfully?')) {
                this.markAsSettled(from, to, amount);
                this.closeSettlementModal();
            }
        }, 2000);
    }

    markAsSettled(from, to, amount) {
        // Add a settlement expense to balance out the payment
        const fromFriend = this.friends.find(f => f.name === from);
        const toFriend = this.friends.find(f => f.name === to);
        
        if (fromFriend && toFriend) {
            const settlementExpense = {
                id: Date.now(),
                description: `Settlement: ${from} → ${to}`,
                amount: amount,
                paidBy: fromFriend.id,
                splitBetween: [fromFriend.id],
                amountPerPerson: amount,
                addedAt: new Date().toISOString(),
                isSettlement: true
            };

            this.expenses.push(settlementExpense);
            this.saveExpenses();
            this.renderExpenses();
            this.renderBalances();
            this.showToast('Payment marked as settled!', 'success');
        }
    }

    // Utility Methods
    saveFriends() {
        localStorage.setItem('friends', JSON.stringify(this.friends));
    }

    saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const icon = toast.querySelector('i');
        
        toastMessage.textContent = message;
        
        // Update icon and colors based on type
        if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle text-red-500 mr-2';
            toast.classList.add('border-red-200');
            toast.classList.remove('border-purple-200');
        } else {
            icon.className = 'fas fa-check-circle text-green-500 mr-2';
            toast.classList.add('border-purple-200');
            toast.classList.remove('border-red-200');
        }
        
        toast.classList.remove('translate-x-full');
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
        }, 3000);
    }

    // Export data for backup
    exportData() {
        const data = {
            friends: this.friends,
            expenses: this.expenses,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paysplitz-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Global Functions (called from HTML)
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new PaySplitz();
});

function addFriend() {
    const name = document.getElementById('friendName').value;
    const phone = document.getElementById('friendPhone').value;
    app.addFriend(name, phone);
    
    // Clear inputs
    document.getElementById('friendName').value = '';
    document.getElementById('friendPhone').value = '';
}

function addExpense() {
    const description = document.getElementById('expenseDescription').value;
    const amount = document.getElementById('expenseAmount').value;
    const paidBy = document.getElementById('expensePaidBy').value;
    const splitBetween = Array.from(document.querySelectorAll('#splitOptions input[type="checkbox"]:checked'))
        .map(cb => parseInt(cb.value));
    
    app.addExpense(description, amount, paidBy, splitBetween);
}

function closeSettlementModal() {
    app.closeSettlementModal();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        app.closeSettlementModal();
    }
});

// Auto-save functionality
setInterval(() => {
    app.saveFriends();
    app.saveExpenses();
}, 30000); // Auto-save every 30 seconds