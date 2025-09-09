import React, { useState, useEffect } from 'react';
import { Quote, Customer, Room, QuoteItem } from './types';
import { customers, models, products, processings, processingRules, productDependencies } from './data/sampleData';
import MinimalDashboard from './components/MinimalDashboard';
import CustomerSelector from './components/CustomerSelector';
import EnhancedRoomManager from './components/EnhancedRoomManager';
import CleanProductCatalog from './components/CleanProductCatalog';
import LiveProcessingProductManager from './components/LiveProcessingProductManager';

// Define the 4 clear phases
type WorkflowPhase = 'customer_config' | 'room_config' | 'product_config' | 'quote_finalize';
type AppView = 'dashboard' | 'workflow';

interface WorkflowState {
  currentPhase: WorkflowPhase;
  customer: Customer | null;
  rooms: Room[];
  currentRoomId: string | null; // Track which room is currently being configured
  products: Quote['items'];
  quote: Quote | null;
  savedStates: {
    customer?: Customer;
    rooms?: Room[];
    products?: Quote['items'];
  };
}

function ImprovedApp() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentPhase: 'customer_config',
    customer: null,
    rooms: [],
    currentRoomId: null,
    products: [],
    quote: null,
    savedStates: {}
  });

  // Phase progression with validation
  const canProceedToNextPhase = () => {
    switch (workflow.currentPhase) {
      case 'customer_config': return workflow.customer !== null;
      case 'room_config': return workflow.rooms.length > 0;
      case 'product_config': {
        // Ensure there's at least one product total (can be lenient about all rooms having products)
        return workflow.products.length > 0;
      }
      case 'quote_finalize': return workflow.quote !== null;
      default: return false;
    }
  };

  const proceedToNextPhase = () => {
    const phaseOrder: WorkflowPhase[] = ['customer_config', 'room_config', 'product_config', 'quote_finalize'];
    const currentIndex = phaseOrder.indexOf(workflow.currentPhase);
    
    if (currentIndex < phaseOrder.length - 1 && canProceedToNextPhase()) {
      const nextPhase = phaseOrder[currentIndex + 1];
      
      // Auto-create quote when moving to product config
      if (nextPhase === 'product_config' && !workflow.quote) {
        createQuoteFromCurrentState();
      }
      
      // Update quote when moving to quote finalization
      if (nextPhase === 'quote_finalize') {
        createQuoteFromCurrentState();
      }
      
      setWorkflow(prev => ({
        ...prev,
        currentPhase: nextPhase,
        savedStates: {
          ...prev.savedStates,
          [prev.currentPhase]: getCurrentPhaseData()
        }
      }));
    }
  };

  const goToPreviousPhase = () => {
    const phaseOrder: WorkflowPhase[] = ['customer_config', 'room_config', 'product_config', 'quote_finalize'];
    const currentIndex = phaseOrder.indexOf(workflow.currentPhase);
    
    if (currentIndex > 0) {
      const prevPhase = phaseOrder[currentIndex - 1];
      setWorkflow(prev => ({ ...prev, currentPhase: prevPhase }));
    }
  };

  const getCurrentPhaseData = () => {
    switch (workflow.currentPhase) {
      case 'customer_config': return workflow.customer;
      case 'room_config': return workflow.rooms;
      case 'product_config': return workflow.products;
      case 'quote_finalize': return workflow.quote;
      default: return null;
    }
  };

  // Save current phase state
  const saveCurrentPhase = () => {
    const currentData = getCurrentPhaseData();
    setWorkflow(prev => ({
      ...prev,
      savedStates: {
        ...prev.savedStates,
        [prev.currentPhase]: currentData
      }
    }));
    
    // Show save confirmation
    const phaseNames = {
      customer_config: 'Customer Configuration',
      room_config: 'Room Configuration', 
      product_config: 'Product Configuration',
      quote_finalize: 'Quote'
    };
    alert(`${phaseNames[workflow.currentPhase]} saved successfully!`);
  };

  // Create quote from current state
  const createQuoteFromCurrentState = () => {
    if (!workflow.customer || workflow.rooms.length === 0) return;

    const newQuote: Quote = {
      id: Date.now().toString(),
      customerId: workflow.customer.id,
      rooms: workflow.rooms,
      items: workflow.products,
      contractDiscount: 0,
      customerDiscount: workflow.customer.discountPercentage || 0,
      orderDiscount: 0,
      subtotal: 0,
      totalDiscount: 0,
      finalTotal: 0,
      status: 'draft',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      requiresApproval: false,
      approvalThreshold: 5000
    };

    const updatedQuote = recalculateQuote(newQuote);
    setWorkflow(prev => ({ ...prev, quote: updatedQuote }));
  };

  // Recalculate quote totals
  const recalculateQuote = (quote: Quote): Quote => {
    const subtotal = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const customerDiscount = subtotal * (quote.customerDiscount / 100);
    const totalDiscount = customerDiscount + quote.orderDiscount;
    const finalTotal = subtotal - totalDiscount;

    return {
      ...quote,
      subtotal,
      totalDiscount,
      finalTotal,
      requiresApproval: finalTotal > quote.approvalThreshold
    };
  };

  // Cascading updates when stepping back
  useEffect(() => {
    // If customer changes, clear rooms and products
    if (workflow.currentPhase === 'customer_config' && workflow.rooms.length > 0) {
      setWorkflow(prev => ({ ...prev, rooms: [], currentRoomId: null, products: [], quote: null }));
    }
    
    // If rooms change, clear products that don't match any room's model
    if (workflow.currentPhase === 'room_config' && workflow.rooms.length > 0 && workflow.products.length > 0) {
      const roomModelIds = workflow.rooms.map(room => {
        const roomModel = models.find(m => m.id === room.frontModelId);
        return roomModel?.id;
      }).filter(Boolean);
      
      if (roomModelIds.length > 0) {
        const compatibleProducts = workflow.products.filter(item => {
          const product = products.find(p => p.id === item.productId);
          return product && roomModelIds.includes(product.modelId);
        });
        
        if (compatibleProducts.length !== workflow.products.length) {
          setWorkflow(prev => ({ 
            ...prev, 
            products: compatibleProducts,
            quote: null // Clear quote to force recalculation
          }));
        }
      }
    }

    // Auto-select first room when entering product config phase
    if (workflow.currentPhase === 'product_config' && workflow.rooms.length > 0 && !workflow.currentRoomId) {
      setWorkflow(prev => ({ ...prev, currentRoomId: prev.rooms[0].id }));
    }
  }, [workflow.customer, workflow.rooms, workflow.currentPhase, workflow.products, workflow.currentRoomId]);

  // Phase-specific handlers
  const handleCustomerSelect = (customer: Customer) => {
    setWorkflow(prev => ({ ...prev, customer }));
  };

  const handleRoomCreate = (room: Room) => {
    setWorkflow(prev => ({ 
      ...prev, 
      rooms: [...prev.rooms, room],
      currentRoomId: room.id
    }));
  };

  const handleRoomEdit = (editedRoom: Room) => {
    setWorkflow(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === editedRoom.id ? editedRoom : room
      )
    }));
  };

  const handleRoomSelect = (roomId: string) => {
    setWorkflow(prev => ({
      ...prev,
      currentRoomId: roomId
    }));
  };

  // Helper function to get the current room
  const getCurrentRoom = (): Room | null => {
    if (workflow.currentRoomId) {
      return workflow.rooms.find(room => room.id === workflow.currentRoomId) || null;
    }
    // If no specific room is selected, return the last added room
    return workflow.rooms.length > 0 ? workflow.rooms[workflow.rooms.length - 1] : null;
  };

  const handleProductAdd = (productId: string, quantity: number = 1) => {
    const currentRoom = getCurrentRoom();
    if (!currentRoom) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Apply room-level inherited processings
    const inheritedProcessings = currentRoom.activatedProcessings
      .map((processingId: string) => {
        const processing = processings.find(p => p.id === processingId);
        if (!processing) return null;
        
        // Check if this processing is applicable to this product category
        if (!processing.applicableProductCategories.includes(product.category)) {
          return null;
        }

        let calculatedPrice = 0;
        if (processing.pricingType === 'per_unit') {
          calculatedPrice = processing.price * quantity;
        } else if (processing.pricingType === 'percentage') {
          calculatedPrice = (product.basePrice * quantity) * (processing.price / 100);
        } else if (processing.pricingType === 'per_dimension' && product.dimensions) {
          // Basic dimension calculation - can be enhanced with formula evaluation
          const dimensionSum = (product.dimensions.width || 0) + 
                               (product.dimensions.height || 0) + 
                               (product.dimensions.depth || 0);
          calculatedPrice = dimensionSum * processing.price * quantity;
        }

        return {
          processingId: processing.id,
          calculatedPrice,
          isInherited: true,
          appliedDate: new Date().toISOString()
        };
      })
      .filter(Boolean);

    const newItem: QuoteItem = {
      id: Date.now().toString(),
      productId,
      roomId: currentRoom.id,
      quantity,
      appliedProcessings: inheritedProcessings as any[],
      basePrice: product.basePrice,
      totalPrice: (product.basePrice * quantity) + inheritedProcessings.reduce((sum, p) => sum + (p?.calculatedPrice || 0), 0)
    };

    setWorkflow(prev => ({
      ...prev,
      products: [...prev.products, newItem]
    }));
  };

  const handleQuoteUpdate = (updatedQuote: Quote) => {
    setWorkflow(prev => ({ ...prev, quote: updatedQuote }));
  };

  // Remove product from workflow
  const removeProduct = (productId: string) => {
    setWorkflow(prev => ({
      ...prev,
      products: prev.products.filter(item => item.productId !== productId)
    }));
  };

  const adjustProductQuantity = (productId: string, change: number) => {
    setWorkflow(prev => ({
      ...prev,
      products: prev.products.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + change;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0) // Remove items with 0 or negative quantity
    }));
  };

  // Print quote - Enhanced professional print functionality
  const printQuote = () => {
    if (!workflow.quote || !workflow.customer) {
      alert('No quote available to print.');
      return;
    }

    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(generateEnhancedPrintHTML());
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    } catch (error) {
      console.error('Print failed:', error);
      alert('Print functionality is not available in this browser.');
    }
  };

  // Generate enhanced HTML for professional quote printing
  const generateEnhancedPrintHTML = () => {
    const quote = workflow.quote!;
    const customer = workflow.customer!;
    
    const getProduct = (productId: string) => products.find(p => p.id === productId);
    const getModel = (modelId: string) => models.find(m => m.id === modelId);
    const getProcessing = (processingId: string) => processings.find(p => p.id === processingId);
    
    // Group items by room
    const itemsByRoom = quote.items.reduce((acc, item) => {
      const roomId = item.roomId;
      if (!acc[roomId]) {
        acc[roomId] = [];
      }
      acc[roomId].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Professional Quote - ${quote.quoteNumber || quote.id}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: white;
              font-size: 12px;
            }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            
            /* Header Styles */
            .header { 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .company-info h1 { 
              font-size: 28px; 
              font-weight: bold; 
              color: #2563eb; 
              margin-bottom: 5px;
            }
            .company-info p { color: #666; font-size: 14px; }
            .quote-info { text-align: right; }
            .quote-info h2 { 
              font-size: 24px; 
              color: #1f2937; 
              margin-bottom: 10px;
            }
            .quote-info p { margin-bottom: 5px; }
            
            /* Customer Section */
            .customer-section { 
              background-color: #f8fafc; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 30px; 
            }
            .customer-section h3 { 
              font-size: 18px; 
              color: #374151; 
              margin-bottom: 15px;
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 5px;
            }
            .customer-details { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
            }
            
            /* Room Sections */
            .room-section { 
              margin-bottom: 40px; 
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            .room-header { 
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
              color: white; 
              padding: 15px 20px; 
            }
            .room-header h3 { font-size: 20px; margin-bottom: 5px; }
            .room-header p { opacity: 0.9; }
            .room-auto-processings { 
              background-color: #eff6ff; 
              padding: 15px 20px; 
              border-bottom: 1px solid #e5e7eb;
            }
            .room-auto-processings h4 { 
              color: #1e40af; 
              margin-bottom: 10px;
              font-size: 14px;
            }
            .auto-processing-list { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 8px; 
            }
            .auto-processing-tag { 
              background-color: #dbeafe; 
              color: #1e40af; 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 11px;
              font-weight: 500;
            }
            
            /* Product Tables */
            .products-table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            .products-table th { 
              background-color: #f9fafb; 
              padding: 12px; 
              text-align: left; 
              font-weight: 600;
              border-bottom: 2px solid #e5e7eb;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .products-table td { 
              padding: 12px; 
              border-bottom: 1px solid #f3f4f6; 
              vertical-align: top;
            }
            .product-row:hover { background-color: #fafafa; }
            .product-name { font-weight: 600; color: #1f2937; }
            .product-category { 
              color: #6b7280; 
              font-size: 10px; 
              text-transform: uppercase;
            }
            
            /* Processing Details */
            .processing-details { 
              margin-top: 8px; 
            }
            .processing-item { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              padding: 4px 0;
              font-size: 11px;
            }
            .processing-inherited { 
              color: #059669; 
              font-weight: 500;
            }
            .processing-inherited::before { 
              content: "🏠 "; 
            }
            .processing-manual { 
              color: #7c3aed; 
              font-weight: 500;
            }
            .processing-manual::before { 
              content: "⚙️ "; 
            }
            
            /* Summary Section */
            .summary-section { 
              margin-top: 40px; 
              background-color: #f8fafc; 
              padding: 25px; 
              border-radius: 8px;
            }
            .summary-table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            .summary-table td { 
              padding: 8px 0; 
              border-bottom: 1px solid #e5e7eb;
            }
            .summary-table .label { font-weight: 600; }
            .summary-table .value { 
              text-align: right; 
              font-weight: 600;
            }
            .discount { color: #dc2626; }
            .total-row { 
              font-size: 18px; 
              background-color: #1e40af; 
              color: white;
            }
            .total-row td { 
              padding: 15px 0; 
              border: none;
            }
            
            /* Footer */
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              text-align: center; 
              color: #6b7280; 
              font-size: 10px;
            }
            
            /* Print Styles */
            @media print {
              body { font-size: 11px; }
              .container { max-width: none; margin: 0; padding: 10px; }
              .room-section { page-break-inside: avoid; }
              .summary-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                <h1>Kitchen CPQ Solutions</h1>
                <p>Professional Kitchen Design & Quote System</p>
                <p>📧 quotes@kitchencpq.com | 📞 (555) 123-4567</p>
              </div>
              <div class="quote-info">
                <h2>QUOTE</h2>
                <p><strong>Quote #:</strong> ${quote.quoteNumber || quote.id}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Valid Until:</strong> ${new Date(quote.expiresAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${quote.status.toUpperCase()}</p>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="customer-section">
              <h3>Customer Information</h3>
              <div class="customer-details">
                <div>
                  <p><strong>Customer:</strong> ${customer.name}</p>
                  <p><strong>Contract Type:</strong> ${customer.contractId || 'Standard'}</p>
                </div>
                <div>
                  <p><strong>Discount Level:</strong> ${customer.discountPercentage}%</p>
                  <p><strong>Quote Generated:</strong> ${new Date(quote.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <!-- Room-based Product Listing -->
            ${quote.rooms.map(room => {
              const roomItems = itemsByRoom[room.id] || [];
              const roomModel = getModel(room.frontModelId);
              const roomProcessings = room.activatedProcessings
                .map(id => getProcessing(id))
                .filter(Boolean);
              
              return `
                <div class="room-section">
                  <div class="room-header">
                    <h3>${room.name}</h3>
                    <p>Style: ${roomModel?.name || 'Unknown'} (${roomModel?.category || 'N/A'})</p>
                    ${room.description ? `<p>${room.description}</p>` : ''}
                  </div>
                  
                  ${roomProcessings.length > 0 ? `
                    <div class="room-auto-processings">
                      <h4>🏠 Auto-Applied Room Processings</h4>
                      <div class="auto-processing-list">
                        ${roomProcessings.map(processing => 
                          `<span class="auto-processing-tag">${processing?.name || 'Unknown'}</span>`
                        ).join('')}
                      </div>
                      <p style="margin-top: 8px; font-size: 11px; color: #6b7280;">
                        These processings are automatically applied to all applicable products in this room.
                      </p>
                    </div>
                  ` : ''}
                  
                  <table class="products-table">
                    <thead>
                      <tr>
                        <th style="width: 25%;">Product</th>
                        <th style="width: 20%;">Details</th>
                        <th style="width: 10%;">Qty</th>
                        <th style="width: 15%;">Base Price</th>
                        <th style="width: 20%;">Applied Processings</th>
                        <th style="width: 10%;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${roomItems.map(item => {
                        const product = getProduct(item.productId);
                        const inheritedProcessings = item.appliedProcessings.filter((ap: any) => ap.isInherited);
                        const manualProcessings = item.appliedProcessings.filter((ap: any) => !ap.isInherited);
                        
                        return `
                          <tr class="product-row">
                            <td>
                              <div class="product-name">${product?.name || 'Unknown Product'}</div>
                              <div class="product-category">${product?.category || 'N/A'}</div>
                            </td>
                            <td>
                              <div style="font-size: 11px;">
                                ${product?.description || 'No description'}
                                ${product?.dimensions ? `<br><strong>Dimensions:</strong> ${product.dimensions.width || 'N/A'}" W × ${product.dimensions.height || 'N/A'}" H × ${product.dimensions.depth || 'N/A'}" D` : ''}
                              </div>
                            </td>
                            <td style="text-align: center; font-weight: 600;">${item.quantity}</td>
                            <td style="text-align: right;">$${item.basePrice.toFixed(2)}</td>
                            <td>
                              <div class="processing-details">
                                ${inheritedProcessings.map((ap: any) => {
                                  const processing = getProcessing(ap.processingId);
                                  return `
                                    <div class="processing-item">
                                      <span class="processing-inherited">${processing?.name || 'Unknown'}</span>
                                      <span>+$${ap.calculatedPrice.toFixed(2)}</span>
                                    </div>
                                  `;
                                }).join('')}
                                ${manualProcessings.map((ap: any) => {
                                  const processing = getProcessing(ap.processingId);
                                  return `
                                    <div class="processing-item">
                                      <span class="processing-manual">${processing?.name || 'Unknown'}</span>
                                      <span>+$${ap.calculatedPrice.toFixed(2)}</span>
                                    </div>
                                  `;
                                }).join('')}
                                ${item.appliedProcessings.length === 0 ? '<em style="color: #9ca3af;">No processings applied</em>' : ''}
                              </div>
                            </td>
                            <td style="text-align: right; font-weight: 600; color: #1f2937;">$${item.totalPrice.toFixed(2)}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `;
            }).join('')}

            <!-- Quote Summary -->
            <div class="summary-section">
              <h3 style="margin-bottom: 20px; color: #374151;">Quote Summary</h3>
              <table class="summary-table">
                <tr>
                  <td class="label">Subtotal:</td>
                  <td class="value">$${quote.subtotal.toFixed(2)}</td>
                </tr>
                ${quote.contractDiscount > 0 ? `
                <tr>
                  <td class="label">Contract Discount (${quote.contractDiscount}%):</td>
                  <td class="value discount">-$${(quote.subtotal * quote.contractDiscount / 100).toFixed(2)}</td>
                </tr>
                ` : ''}
                ${quote.customerDiscount > 0 ? `
                <tr>
                  <td class="label">Customer Discount (${quote.customerDiscount}%):</td>
                  <td class="value discount">-$${((quote.subtotal - quote.subtotal * quote.contractDiscount / 100) * quote.customerDiscount / 100).toFixed(2)}</td>
                </tr>
                ` : ''}
                ${quote.orderDiscount > 0 ? `
                <tr>
                  <td class="label">Order Discount:</td>
                  <td class="value discount">-$${quote.orderDiscount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td class="label">FINAL TOTAL:</td>
                  <td class="value">$${quote.finalTotal.toFixed(2)}</td>
                </tr>
              </table>
              
              ${quote.notes ? `
                <div style="margin-top: 25px;">
                  <h4 style="color: #374151; margin-bottom: 10px;">Additional Notes:</h4>
                  <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6;">
                    ${quote.notes}
                  </p>
                </div>
              ` : ''}
              
              ${quote.requiresApproval ? `
                <div style="margin-top: 25px; background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px;">
                  <strong>⚠️ Management Approval Required:</strong> This quote exceeds $${quote.approvalThreshold.toLocaleString()} and requires management approval before proceeding.
                </div>
              ` : ''}
            </div>

            <!-- Footer -->
            <div class="footer">
              <p><strong>Legend:</strong> 🏠 = Auto-applied from room configuration | ⚙️ = Product-specific processing</p>
              <p>This quote is valid until ${new Date(quote.expiresAt).toLocaleDateString()}. Terms and conditions apply.</p>
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p style="margin-top: 10px;">Thank you for choosing Kitchen CPQ Solutions!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Dashboard handlers
  const handleStartNewQuote = (customer: Customer) => {
    setWorkflow({
      currentPhase: 'room_config', // Skip customer selection, go directly to room
      customer,
      rooms: [],
      currentRoomId: null,
      products: [],
      quote: null,
      savedStates: {}
    });
    setCurrentView('workflow');
  };

  const handleEditQuote = (quote: Quote) => {
    const customer = customers.find(c => c.id === quote.customerId);
    if (customer && quote.rooms.length > 0) {
      setWorkflow({
        currentPhase: 'quote_finalize',
        customer,
        rooms: quote.rooms,
        currentRoomId: quote.rooms[0].id,
        products: quote.items,
        quote,
        savedStates: {}
      });
      setCurrentView('workflow');
    }
  };

  const handleReturnToDashboard = () => {
    setCurrentView('dashboard');
    // Reset workflow when returning to dashboard
    setWorkflow({
      currentPhase: 'customer_config',
      customer: null,
      rooms: [],
      currentRoomId: null,
      products: [],
      quote: null,
      savedStates: {}
    });
  };

  const handleSaveQuote = () => {
    console.log('handleSaveQuote called');
    console.log('workflow.quote:', workflow.quote);
    
    if (workflow.quote) {
      // Ensure quote has all required properties
      const quoteToSave = {
        ...workflow.quote,
        id: workflow.quote.id || Date.now().toString(),
        quoteNumber: workflow.quote.quoteNumber || `QUOTE-${Date.now()}`,
        savedAt: new Date(),
        status: workflow.quote.status || 'draft'
      };
      
      console.log('Saving quote:', quoteToSave);
      
      // Save to localStorage
      const existingQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
      const updatedQuotes = [...existingQuotes.filter((q: Quote) => q.id !== quoteToSave.id), quoteToSave];
      localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
      
      console.log('Quotes after save:', updatedQuotes.length);
      
      alert('Quote saved successfully!');
      handleReturnToDashboard();
    } else {
      console.log('No quote to save - workflow.quote is null');
      // Try to create quote if it doesn't exist
      if (workflow.customer && workflow.rooms.length > 0 && workflow.products.length > 0) {
        console.log('Creating quote before saving...');
        createQuoteFromCurrentState();
        
        // Retry save after creating quote
        setTimeout(() => {
          if (workflow.quote) {
            handleSaveQuote();
          } else {
            alert('Error: Unable to create quote for saving');
          }
        }, 100);
      } else {
        alert('Error: Quote cannot be saved - missing required data');
      }
    }
  };

  const resetWorkflow = () => {
    setWorkflow({
      currentPhase: 'customer_config',
      customer: null,
      rooms: [],
      currentRoomId: null,
      products: [],
      quote: null,
      savedStates: {}
    });
  };

  // Get the current room's model
  const getCurrentRoomModel = () => {
    const currentRoom = getCurrentRoom();
    if (!currentRoom) return null;
    return models.find(m => m.id === currentRoom.frontModelId) || null;
  };

  // Phase titles and descriptions
  const phaseInfo = {
    customer_config: {
      title: 'Phase 1: Customer Configuration',
      description: 'Select and configure customer details'
    },
    room_config: {
      title: 'Phase 2: Room Configuration', 
      description: 'Create room and select styling preferences'
    },
    product_config: {
      title: 'Phase 3: Product Configuration',
      description: 'Select products that inherit room styling'
    },
    quote_finalize: {
      title: 'Phase 4: Quote Finalization',
      description: 'Review, adjust discounts, and finalize quote'
    }
  };

  // Dashboard view
  if (currentView === 'dashboard') {
    return (
      <MinimalDashboard
        customers={customers}
        onStartNewQuote={handleStartNewQuote}
        onEditQuote={handleEditQuote}
      />
    );
  }

  // Workflow view
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Debug Panel - Always Visible */}
      <div className="bg-red-200 border-2 border-red-500 p-4">
        <h4 className="text-lg font-bold text-red-800 mb-2">DEBUG PANEL - ALWAYS VISIBLE</h4>
        <p className="text-sm text-red-700 mb-2">Current View: {currentView}</p>
        <p className="text-sm text-red-700 mb-2">Current Phase: {workflow.currentPhase}</p>
        <p className="text-sm text-red-700 mb-2">Customer: {workflow.customer?.name || 'None'}</p>
        <p className="text-sm text-red-700 mb-2">Rooms: {workflow.rooms.length}</p>
        <p className="text-sm text-red-700 mb-2">Products: {workflow.products.length}</p>
        <button 
          onClick={() => {
            console.log('=== DEBUG INFO ===');
            console.log('Current view:', currentView);
            console.log('Workflow:', workflow);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded font-bold"
        >
          🔧 LOG DEBUG INFO
        </button>
      </div>

      {/* Header with Phase Progression */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Kitchen CPQ</h1>
              <span className="ml-4 text-sm text-gray-500">Improved Workflow</span>
            </div>
            
            {/* Phase Progress Indicator */}
            <div className="flex items-center space-x-2">
              {(['customer_config', 'room_config', 'product_config', 'quote_finalize'] as WorkflowPhase[]).map((phase, index) => {
                const phaseNames = ['Customer', 'Room', 'Products', 'Quote'];
                const isActive = workflow.currentPhase === phase;
                const isCompleted = (['customer_config', 'room_config', 'product_config', 'quote_finalize'] as WorkflowPhase[]).indexOf(workflow.currentPhase) > index;
                
                return (
                  <div key={phase} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {phaseNames[index]}
                    </span>
                    {index < 3 && <div className="w-8 h-0.5 bg-gray-300 mx-3" />}
                  </div>
                );
              })}
            </div>

            {/* Current Phase Info */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {phaseInfo[workflow.currentPhase].title}
              </div>
              <div className="text-xs text-gray-500">
                {phaseInfo[workflow.currentPhase].description}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
        
        {/* Phase 1: Customer Configuration */}
        {workflow.currentPhase === 'customer_config' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Customer</h2>
              <p className="text-gray-600">Select customer to start quote process</p>
            </div>
            
            <CustomerSelector
              customers={customers}
              contracts={[]}
              onCustomerSelect={handleCustomerSelect}
            />

            {workflow.customer && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-green-900">
                      Customer Selected: {workflow.customer.name}
                    </h3>
                    <p className="text-sm text-green-700">
                      Customer Discount: {workflow.customer.discountPercentage}%
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={saveCurrentPhase}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Save Customer
                    </button>
                    <button
                      onClick={proceedToNextPhase}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Proceed to Room Setup →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Room Configuration */}
        {workflow.currentPhase === 'room_config' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure Room</h2>
              <p className="text-gray-600">
                Customer: <span className="font-medium">{workflow.customer?.name}</span>
              </p>
            </div>

            <EnhancedRoomManager
              models={models}
              processings={processings}
              onCreateQuote={handleRoomCreate}
              existingRooms={workflow.rooms}
              onAddRoom={handleRoomCreate}
              onEditRoom={handleRoomEdit}
              onSelectRoom={handleRoomSelect}
              currentRoomId={workflow.currentRoomId}
            />

            <div className="mt-6 flex justify-between">
              <button
                onClick={goToPreviousPhase}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                ← Back to Customer
              </button>

              {workflow.rooms.length > 0 && (
                <div className="flex space-x-3">
                  <button
                    onClick={saveCurrentPhase}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Save Room Config
                  </button>
                  <button
                    onClick={proceedToNextPhase}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Proceed to Products →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3: Product Configuration */}
        {workflow.currentPhase === 'product_config' && workflow.rooms.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure Products</h2>
              <p className="text-gray-600">
                Total Rooms: <span className="font-medium">{workflow.rooms.length}</span>
              </p>
            </div>

            {/* Room Selector */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Room to Configure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {workflow.rooms.map((room, index) => {
                  const roomModel = models.find(m => m.id === room.frontModelId);
                  const roomProductCount = workflow.products.filter(p => p.roomId === room.id).length;
                  const isActive = workflow.currentRoomId === room.id;
                  
                  return (
                    <button
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                          {room.name}
                        </h4>
                        {isActive && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      {room.description && (
                        <p className="text-sm text-gray-700 mb-2 italic">
                          "{room.description}"
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mb-1">
                        Style: {roomModel?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Products: {roomProductCount}
                      </p>
                    </button>
                  );
                })}
              </div>
              {!workflow.currentRoomId && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    👆 Select a room above to start adding products
                  </p>
                </div>
              )}
            </div>

            {/* Product Configuration for Selected Room */}
            {workflow.currentRoomId && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Adding Products to: <span className="text-blue-600">{getCurrentRoom()?.name}</span>
                    </h3>
                    {getCurrentRoom()?.description && (
                      <p className="text-sm text-gray-700 mb-2 italic">
                        Room Description: "{getCurrentRoom()?.description}"
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Style: {getCurrentRoomModel()?.name} • Products will inherit this room's configuration
                    </p>
                  </div>
                  <CleanProductCatalog
                    models={models}
                    products={products}
                    selectedModel={getCurrentRoomModel()}
                    onModelSelect={() => {}} // Disabled in improved workflow
                    onProductSelect={(product, quantity) => handleProductAdd(product.id, quantity)}
                    hasQuote={true}
                    onCreateQuote={() => {}}
                  />
                </div>
                
                <div className="space-y-6">
                  {/* Current Room Products */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {getCurrentRoom()?.name} Products
                    </h3>
                    {(() => {
                      const currentRoomProducts = workflow.products.filter(p => p.roomId === workflow.currentRoomId);
                      return currentRoomProducts.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <p className="text-sm">No products added to this room</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentRoomProducts.map((product) => {
                            const productDetails = products.find(p => p.id === product.productId);
                            return (
                              <div key={product.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">{productDetails?.name}</h4>
                                    <p className="text-xs text-gray-600">${productDetails?.basePrice.toFixed(2)} each</p>
                                  </div>
                                  <button
                                    onClick={() => removeProduct(product.productId)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">Quantity:</span>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => adjustProductQuantity(product.productId, -1)}
                                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm"
                                    >
                                      −
                                    </button>
                                    <span className="text-sm font-medium w-8 text-center">{product.quantity}</span>
                                    <button
                                      onClick={() => adjustProductQuantity(product.productId, 1)}
                                      className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white text-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Total for this product */}
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                  <span className="text-xs text-gray-600">Total:</span>
                                  <span className="text-sm font-semibold text-green-600">
                                    ${product.totalPrice.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          
                          <div className="border-t border-gray-200 pt-3 mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Room Total:</span>
                              <span className="font-medium text-green-600">
                                ${currentRoomProducts.reduce((sum, product) => sum + product.totalPrice, 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* All Rooms Summary */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Rooms Summary</h3>
                    <div className="space-y-3">
                      {workflow.rooms.map((room) => {
                        const roomProducts = workflow.products.filter(p => p.roomId === room.id);
                        const roomTotal = roomProducts.reduce((sum, product) => sum + product.totalPrice, 0);
                        
                        return (
                          <div 
                            key={room.id} 
                            className={`p-3 rounded border cursor-pointer transition-colors ${
                              room.id === workflow.currentRoomId 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => handleRoomSelect(room.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-gray-900">{room.name}</h4>
                                <p className="text-xs text-gray-600">{roomProducts.length} products</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-green-600">
                                  ${roomTotal.toFixed(2)}
                                </p>
                                {room.id === workflow.currentRoomId && (
                                  <p className="text-xs text-blue-600">Active</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="border-t border-gray-200 pt-3 mt-4">
                        <div className="flex justify-between text-base font-semibold">
                          <span className="text-gray-900">Grand Total:</span>
                          <span className="text-green-600">
                            ${workflow.products.reduce((sum, product) => sum + product.totalPrice, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={goToPreviousPhase}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                ← Back to Room Setup
              </button>

              {workflow.products.length > 0 && (
                <div className="flex space-x-3">
                  <button
                    onClick={saveCurrentPhase}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Save Product Config
                  </button>
                  <button
                    onClick={proceedToNextPhase}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Proceed to Quote →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 4: Quote Finalization */}
        {workflow.currentPhase === 'quote_finalize' && workflow.quote && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Finalize Quote</h2>
              <p className="text-gray-600">Review and configure final quote details</p>
            </div>

            <LiveProcessingProductManager
              quote={workflow.quote}
              rooms={workflow.quote.rooms}
              products={products}
              processings={processings}
              processingRules={processingRules}
              productDependencies={productDependencies}
              onQuoteUpdate={handleQuoteUpdate}
            />
          </div>
        )}
          </div>

          {/* Enhanced Room-Aware Product Sidebar - Only for product_config phase */}
          {workflow.currentPhase === 'product_config' && (
            <div className="w-80 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3v-8h6v8h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
                Product Management
              </h3>
              
              <div className="space-y-4">
                {/* Quick Room Switcher */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Room Switch</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {workflow.rooms.map((room) => {
                      const roomProducts = workflow.products.filter(p => p.roomId === room.id);
                      const isActive = room.id === workflow.currentRoomId;
                      
                      return (
                        <button
                          key={room.id}
                          onClick={() => handleRoomSelect(room.id)}
                          className={`p-2 rounded text-left text-xs transition-colors ${
                            isActive 
                              ? 'bg-blue-100 border-blue-300 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          } border`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{room.name}</span>
                            <span className="text-green-600">{roomProducts.length}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Products by Room */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Products by Room</h4>
                  {workflow.rooms.map((room) => {
                    const roomProducts = workflow.products.filter(p => p.roomId === room.id);
                    const roomTotal = roomProducts.reduce((sum, product) => sum + product.totalPrice, 0);
                    
                    return (
                      <div key={room.id} className="mb-3">
                        <div 
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            room.id === workflow.currentRoomId 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          } border`}
                          onClick={() => handleRoomSelect(room.id)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <h5 className="text-sm font-medium text-gray-900">{room.name}</h5>
                            <span className="text-xs text-green-600 font-medium">
                              ${roomTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span>{roomProducts.length} products</span>
                            {room.id === workflow.currentRoomId && (
                              <span className="text-blue-600 font-medium">● Active</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Show products if this room is active */}
                        {room.id === workflow.currentRoomId && roomProducts.length > 0 && (
                          <div className="mt-2 ml-2 space-y-1">
                            {roomProducts.slice(0, 3).map((product) => {
                              const productDetails = products.find(p => p.id === product.productId);
                              return (
                                <div key={product.id} className="text-xs text-gray-600 flex justify-between">
                                  <span className="truncate">{productDetails?.name}</span>
                                  <span>×{product.quantity}</span>
                                </div>
                              );
                            })}
                            {roomProducts.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{roomProducts.length - 3} more...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Overall Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Rooms:</span>
                      <span className="font-medium">{workflow.rooms.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Products:</span>
                      <span className="font-medium">{workflow.products.length}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-900">Grand Total:</span>
                      <span className="text-green-600">
                        ${workflow.products.reduce((sum, product) => sum + product.totalPrice, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                {workflow.currentRoomId && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          const currentRoomProducts = workflow.products.filter(p => p.roomId === workflow.currentRoomId);
                          if (currentRoomProducts.length === 0) {
                            alert('No products to clear in this room');
                            return;
                          }
                          if (window.confirm(`Clear all ${currentRoomProducts.length} products from ${getCurrentRoom()?.name}?`)) {
                            setWorkflow(prev => ({
                              ...prev,
                              products: prev.products.filter(p => p.roomId !== workflow.currentRoomId)
                            }));
                          }
                        }}
                        className="w-full text-xs bg-red-50 text-red-700 border border-red-200 rounded px-2 py-1 hover:bg-red-100"
                      >
                        Clear Room Products
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Phase {(['customer_config', 'room_config', 'product_config', 'quote_finalize'] as WorkflowPhase[]).indexOf(workflow.currentPhase) + 1} of 4
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(((['customer_config', 'room_config', 'product_config', 'quote_finalize'] as WorkflowPhase[]).indexOf(workflow.currentPhase) + 1) / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleReturnToDashboard}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm flex items-center"
                >
                  🏠 Main
                </button>

                {/* Save Draft - available from any phase with customer selected */}
                {workflow.customer && (
                  <button
                    onClick={handleSaveQuote}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                  >
                    💾 Save Draft
                  </button>
                )}

                {workflow.currentPhase !== 'customer_config' && (
                  <button
                    onClick={goToPreviousPhase}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                  >
                    ← Back
                  </button>
                )}
                
                {canProceedToNextPhase() && workflow.currentPhase !== 'quote_finalize' && (
                  <button
                    onClick={proceedToNextPhase}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                  >
                    Continue →
                  </button>
                )}

                {workflow.currentPhase === 'quote_finalize' && workflow.quote && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveQuote}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Save & Return
                    </button>
                    <button
                      onClick={() => {
                        // Show preview in new window
                        const previewWindow = window.open('', '_blank');
                        if (previewWindow) {
                          previewWindow.document.write(generateEnhancedPrintHTML());
                          previewWindow.document.close();
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Preview Print
                    </button>
                    <button
                      onClick={printQuote}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Print
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ImprovedApp;
