import React, { useState, useEffect } from 'react';
import { Quote, Customer, Room, QuoteItem } from './types';
import { customers, models, products, processings } from './data/sampleData';
import MinimalDashboard from './components/MinimalDashboard';
import CustomerSelector from './components/CustomerSelector';
import EnhancedRoomManager from './components/EnhancedRoomManager';
import CleanProductCatalog from './components/CleanProductCatalog';
import LiveOrderGrid from './components/LiveOrderGrid';
import AvailableProcessing from './components/AvailableProcessing';

// Define the 4 clear phases (processing integrated into product_config)
type WorkflowPhase = 'customer_config' | 'room_config' | 'product_config' | 'fees_config';
type AppView = 'dashboard' | 'workflow';

interface WorkflowState {
  currentPhase: WorkflowPhase;
  customer: Customer | null;
  rooms: Room[];
  currentRoomId: string | null; // Track which room is currently being configured
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
    quote: null,
    savedStates: {}
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  

  // Phase progression with validation
  const canProceedToNextPhase = () => {
    switch (workflow.currentPhase) {
      case 'customer_config': return workflow.customer !== null;
      case 'room_config': return workflow.rooms.length > 0;
      case 'product_config': {
        // Ensure there's at least one product total (processing validation will be added later)
        return (workflow.quote?.items?.length || 0) > 0;
      }
      case 'fees_config': return workflow.quote !== null;
      default: return false;
    }
  };

  const proceedToNextPhase = () => {
    const phaseOrder: WorkflowPhase[] = ['customer_config', 'room_config', 'product_config', 'fees_config'];
    const currentIndex = phaseOrder.indexOf(workflow.currentPhase);
    
    if (currentIndex < phaseOrder.length - 1 && canProceedToNextPhase()) {
      const nextPhase = phaseOrder[currentIndex + 1];
      
      // Auto-create quote when moving to product config
      if (nextPhase === 'product_config' && !workflow.quote) {
        createQuoteFromCurrentState();
      }
      
      // Auto-create quote when moving to processing config if not already created
      if (nextPhase === 'fees_config' && !workflow.quote) {
        createQuoteFromCurrentState();
      }
      
      // Update quote when moving to fees configuration (only if quote doesn't exist)
      if (nextPhase === 'fees_config' && !workflow.quote) {
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
    const phaseOrder: WorkflowPhase[] = ['customer_config', 'room_config', 'product_config', 'fees_config'];
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
      case 'product_config': return workflow.quote?.items || [];
      case 'fees_config': return workflow.quote;
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
      fees_config: 'Fees & Delivery'
    };
    alert(`${phaseNames[workflow.currentPhase]} saved successfully!`);
  };

  // Create quote from current state
  const createQuoteFromCurrentState = () => {
    if (!workflow.customer || workflow.rooms.length === 0) return;

    const newQuote: Quote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: workflow.customer.id,
      rooms: workflow.rooms,
      items: workflow.quote?.items || [],
      contractDiscount: 0,
      customerDiscount: workflow.customer.discountPercentage || 0,
      orderDiscount: 0,
      subtotal: 0,
      totalDiscount: 0,
      deliveryFees: {
        tier1: 0,
        tier2: 0,
        tier3: 0,
        calculated: 0
      },
      environmentalFees: {
        carbonOffsetPercentage: 0,
        sustainabilityFee: 0,
        ecoFriendlyPackaging: false,
        calculated: 0
      },
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
    
    // Calculate delivery fees based on subtotal
    let deliveryFee = 0;
    if (subtotal <= 500) {
      deliveryFee = quote.deliveryFees.tier1;
    } else if (subtotal <= 1000) {
      deliveryFee = quote.deliveryFees.tier2;
    } else {
      deliveryFee = quote.deliveryFees.tier3;
    }
    
    // Calculate environmental fees
    const carbonOffsetFee = subtotal * (quote.environmentalFees.carbonOffsetPercentage / 100);
    const ecoFriendlyFee = quote.environmentalFees.ecoFriendlyPackaging ? 25 : 0;
    const totalEnvironmentalFees = quote.environmentalFees.sustainabilityFee + carbonOffsetFee + ecoFriendlyFee;
    
    // Calculate final total including all fees
    const totalFees = deliveryFee + totalEnvironmentalFees;
    const finalTotal = subtotal - totalDiscount + totalFees;

    return {
      ...quote,
      subtotal,
      totalDiscount,
      deliveryFees: {
        ...quote.deliveryFees,
        calculated: deliveryFee
      },
      environmentalFees: {
        ...quote.environmentalFees,
        calculated: totalEnvironmentalFees
      },
      finalTotal,
      requiresApproval: finalTotal > quote.approvalThreshold
    };
  };

  // Recalculate quote when fees change
  useEffect(() => {
    if (workflow.quote && workflow.currentPhase === 'fees_config') {
      const updatedQuote = recalculateQuote(workflow.quote);
      setWorkflow(prev => ({ ...prev, quote: updatedQuote }));
    }
  }, [workflow.quote?.deliveryFees, workflow.quote?.environmentalFees, workflow.currentPhase]);

  // Cascading updates when stepping back
  useEffect(() => {
    // If customer changes, clear rooms and products
    if (workflow.currentPhase === 'customer_config' && workflow.rooms.length > 0) {
      setWorkflow(prev => ({ ...prev, rooms: [], currentRoomId: null, quote: null }));
    }
    
    // If rooms change, clear products that don't match any room's model
    if (workflow.currentPhase === 'room_config' && workflow.rooms.length > 0 && (workflow.quote?.items?.length || 0) > 0) {
      const roomModelIds = workflow.rooms.map(room => {
        const roomModel = models.find(m => m.id === room.frontModelId);
        return roomModel?.id;
      }).filter(Boolean);
      
      if (roomModelIds.length > 0) {
        const compatibleProducts = (workflow.quote?.items || []).filter(item => {
          const product = products.find(p => p.id === item.productId);
          return product && roomModelIds.includes(product.modelId);
        });
        
        if (compatibleProducts.length !== (workflow.quote?.items?.length || 0)) {
          setWorkflow(prev => ({ 
            ...prev, 
            quote: prev.quote ? {
              ...prev.quote,
              items: compatibleProducts
            } : null
          }));
        }
      }
    }

    // Auto-select first room when entering product config phase
    if (workflow.currentPhase === 'product_config' && workflow.rooms.length > 0 && !workflow.currentRoomId) {
      setWorkflow(prev => ({ ...prev, currentRoomId: prev.rooms[0].id }));
    }
  }, [workflow.customer, workflow.rooms, workflow.currentPhase]);

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
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      roomId: currentRoom.id,
      quantity,
      appliedProcessings: inheritedProcessings as any[],
      basePrice: product.basePrice,
      totalPrice: (product.basePrice * quantity) + inheritedProcessings.reduce((sum, p) => sum + (p?.calculatedPrice || 0), 0)
    };

    setWorkflow(prev => {
      const currentItems = prev.quote?.items || [];
      const updatedItems = [...currentItems, newItem];
      const updatedQuote = prev.quote ? {
        ...prev.quote,
        items: updatedItems,
        subtotal: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
      } : null;
      
      // Use recalculateQuote to properly calculate final total with fees
      const finalQuote = updatedQuote ? recalculateQuote(updatedQuote) : null;
      
      return {
        ...prev,
        quote: finalQuote
      };
    });
  };

  const handleQuoteUpdate = (updatedQuote: Quote) => {
    setWorkflow(prev => ({ 
      ...prev, 
      quote: updatedQuote
    }));
  };

  // Remove product from workflow
  const removeProduct = (productId: string) => {
    setWorkflow(prev => {
      const currentItems = prev.quote?.items || [];
      const updatedItems = currentItems.filter(item => item.productId !== productId);
      const updatedQuote = prev.quote ? {
        ...prev.quote,
        items: updatedItems,
        subtotal: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
      } : null;
      
      // Use recalculateQuote to properly calculate final total with fees
      const finalQuote = updatedQuote ? recalculateQuote(updatedQuote) : null;
      
      return {
        ...prev,
        quote: finalQuote
      };
    });
  };

  const adjustProductQuantity = (productId: string, change: number) => {
    setWorkflow(prev => {
      const currentItems = prev.quote?.items || [];
      const updatedItems = currentItems.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + change;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove items with 0 or negative quantity
      
      const updatedQuote = prev.quote ? {
        ...prev.quote,
        items: updatedItems,
        subtotal: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
      } : null;
      
      // Use recalculateQuote to properly calculate final total with fees
      const finalQuote = updatedQuote ? recalculateQuote(updatedQuote) : null;
      
      return {
        ...prev,
        quote: finalQuote
      };
    });
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
                                  const selectedOptions = ap.selectedOptions || {};
                                  return `
                                    <div class="processing-item">
                                      <div>
                                        <span class="processing-inherited">${processing?.name || 'Unknown'}</span>
                                        <span>+$${ap.calculatedPrice.toFixed(2)}</span>
                                      </div>
                                      ${Object.keys(selectedOptions).length > 0 ? `
                                        <div style="margin-top: 4px; font-size: 10px; color: #6b7280;">
                                          ${Object.entries(selectedOptions).map(([optionId, value]) => {
                                            const option = processing?.options?.find(o => o.id === optionId);
                                            if (!option) return '';
                                            const choice = option.choices?.find(c => c.value === value);
                                            return `<div>• ${option.name}: ${choice?.label || value}</div>`;
                                          }).join('')}
                                        </div>
                                      ` : ''}
                                    </div>
                                  `;
                                }).join('')}
                                ${manualProcessings.map((ap: any) => {
                                  const processing = getProcessing(ap.processingId);
                                  const selectedOptions = ap.selectedOptions || {};
                                  return `
                                    <div class="processing-item">
                                      <div>
                                        <span class="processing-manual">${processing?.name || 'Unknown'}</span>
                                        <span>+$${ap.calculatedPrice.toFixed(2)}</span>
                                      </div>
                                      ${Object.keys(selectedOptions).length > 0 ? `
                                        <div style="margin-top: 4px; font-size: 10px; color: #6b7280;">
                                          ${Object.entries(selectedOptions).map(([optionId, value]) => {
                                            const option = processing?.options?.find(o => o.id === optionId);
                                            if (!option) return '';
                                            const choice = option.choices?.find(c => c.value === value);
                                            return `<div>• ${option.name}: ${choice?.label || value}</div>`;
                                          }).join('')}
                                        </div>
                                      ` : ''}
                                    </div>
                                  `;
                                }).join('')}
                                ${inheritedProcessings.length === 0 && manualProcessings.length === 0 ? '<em style="color: #9ca3af;">No processings applied</em>' : ''}
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
                ${quote.deliveryFees.calculated > 0 ? `
                <tr>
                  <td class="label">Delivery Fee:</td>
                  <td class="value">$${quote.deliveryFees.calculated.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${quote.environmentalFees.calculated > 0 ? `
                <tr>
                  <td class="label">Environmental Fees:</td>
                  <td class="value">$${quote.environmentalFees.calculated.toFixed(2)}</td>
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
      quote: null,
      savedStates: {}
    });
    setCurrentView('workflow');
  };

  const handleEditQuote = (quote: Quote) => {
    const customer = customers.find(c => c.id === quote.customerId);
    if (customer && quote.rooms.length > 0) {
      setWorkflow({
        currentPhase: 'fees_config',
        customer,
        rooms: quote.rooms,
        currentRoomId: quote.rooms[0].id,
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
      if (workflow.customer && workflow.rooms.length > 0 && workflow.quote) {
        const hasItems = (workflow.quote as Quote)?.items?.length && (workflow.quote as Quote).items.length > 0;
        if (hasItems) {
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
        }
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
      description: 'Select products and configure processing options'
    },
    fees_config: {
      title: 'Phase 4: Fees & Delivery Configuration',
      description: 'Configure tiered delivery fees and environmental fees'
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
              {(['customer_config', 'room_config', 'product_config', 'fees_config'] as WorkflowPhase[]).map((phase, index) => {
                const phaseNames = ['Customer', 'Room', 'Products', 'Fees'];
                const isActive = workflow.currentPhase === phase;
                const isCompleted = (['customer_config', 'room_config', 'product_config', 'fees_config'] as WorkflowPhase[]).indexOf(workflow.currentPhase) > index;
                
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

          </div>
        )}

        {/* Phase 3: Product Configuration */}
        {workflow.currentPhase === 'product_config' && workflow.rooms.length > 0 && (
          <div>
            {/* Single Cohesive Header Bar */}
            <div className="bg-white rounded-lg shadow mb-4 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <h2 className="text-lg font-semibold text-gray-900">Configure Products</h2>
                  
                  {/* Room Selection */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Room:</span>
                    <div className="flex space-x-1">
                      {workflow.rooms.map((room) => {
                  const roomProductCount = (workflow.quote?.items || []).filter(p => p.roomId === room.id).length;
                  const isActive = workflow.currentRoomId === room.id;
                  
                  return (
                    <button
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id)}
                            className={`px-2 py-1 rounded text-sm border transition-all ${
                        isActive 
                                ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {room.name} ({roomProductCount})
                    </button>
                  );
                })}
              </div>
              {!workflow.currentRoomId && (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                        Select room
                      </span>
                    )}
                  </div>

                  {/* Style Info */}
                  {workflow.currentRoomId && getCurrentRoomModel() && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Style:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getCurrentRoomModel()?.name}
                      </span>
                </div>
              )}
                </div>
                
                {/* Right side - Room count */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">({workflow.rooms.length} rooms)</span>
                </div>
              </div>
            </div>

            {/* Product Configuration for Selected Room */}
            {workflow.currentRoomId && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-96">
                {/* Available Products - Left Panel (20%) */}
                <div className="lg:col-span-1">
                  <CleanProductCatalog
                    models={models}
                    products={products}
                    selectedModel={getCurrentRoomModel()}
                    onModelSelect={() => {}} // Disabled in improved workflow
                    onProductSelect={(product, quantity) => handleProductAdd(product.id, quantity)}
                    hasQuote={true}
                    onCreateQuote={() => {}}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </div>
                
                {/* Live Order Grid - Center Panel (40%) */}
                <div className="lg:col-span-2">
                  <LiveOrderGrid
                    products={workflow.quote?.items || []}
                    rooms={workflow.rooms}
                    allProducts={products}
                    allProcessings={processings}
                    currentRoomId={workflow.currentRoomId}
                    selectedProductId={selectedProductId}
                    onProductSelect={(productId) => {
                      console.log('🔧 setSelectedProductId called with:', productId);
                      setSelectedProductId(productId);
                    }}
                    onProductRemove={(productId) => {
                      removeProduct(productId);
                      // Clear selection if removed product was selected
                      if (selectedProductId === productId) {
                        setSelectedProductId(null);
                      }
                    }}
                    onQuantityChange={(productId, newQuantity) => {
                      const currentItems = workflow.quote?.items || [];
                      const currentItem = currentItems.find(p => p.id === productId);
                      if (currentItem) {
                        const change = newQuantity - currentItem.quantity;
                        adjustProductQuantity(productId, change);
                      }
                    }}
                    onProcessingRemove={(productId, processingId) => {
                      // Remove processing from the selected product
                      const currentItems = workflow.quote?.items || [];
                      const updatedItems = currentItems.map(p => {
                        if (p.id === productId) {
                          const updatedProcessings = p.appliedProcessings.filter(
                            ap => ap.processingId !== processingId
                          );
                          
                          const newTotalPrice = p.basePrice * p.quantity + 
                            updatedProcessings.reduce((sum, ap) => sum + ap.calculatedPrice, 0);
                          
                          return {
                            ...p,
                            appliedProcessings: updatedProcessings,
                            totalPrice: newTotalPrice
                          };
                        }
                        return p;
                      });
                      
                      const updatedQuote = workflow.quote ? {
                        ...workflow.quote,
                        items: updatedItems,
                        subtotal: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
                      } : null;
                      
                      const finalQuote = updatedQuote ? recalculateQuote(updatedQuote) : null;
                      setWorkflow(prev => ({ ...prev, quote: finalQuote }));
                    }}
                  />
                  </div>

                {/* Available Processing - Center-Right Panel (20%) */}
                <div className="lg:col-span-1">
                  <AvailableProcessing
                    key={selectedProductId || 'no-selection'}
                    selectedProduct={(() => {
                      const found = selectedProductId ? (workflow.quote?.items || []).find(p => p.productId === selectedProductId) || null : null;
                      console.log('🔧 AvailableProcessing selectedProduct:', {
                        selectedProductId,
                        found,
                        workflowProducts: (workflow.quote?.items || []).map(p => ({ id: p.id, productId: p.productId }))
                      });
                      return found;
                    })()}
                    allProducts={products}
                    processings={processings}
                    onProcessingApply={(productId, processing, selectedOptions = {}) => {
                      // Calculate processing price with options
                      let calculatedPrice = processing.price;
                      
                      // Apply price modifiers from selected options
                      if (processing.options) {
                        processing.options.forEach(option => {
                          const selectedValue = selectedOptions[option.id];
                          if (selectedValue && option.choices) {
                            const choice = option.choices.find(c => c.value === selectedValue);
                            if (choice?.priceModifier) {
                              if (processing.pricingType === 'percentage') {
                                calculatedPrice += choice.priceModifier;
                              } else {
                                calculatedPrice += choice.priceModifier;
                              }
                            }
                          }
                        });
                      }

                      // Apply processing to the selected product
                      setWorkflow(prev => {
                        const currentItems = prev.quote?.items || [];
                        const updatedProducts = currentItems.map(p => {
                          if (p.id === productId) {
                            // Check if processing is already applied
                            const existingProcessing = p.appliedProcessings.find(
                              ap => ap.processingId === processing.id
                            );
                            
                            if (existingProcessing) {
                              // Update existing processing
                              return {
                                ...p,
                                appliedProcessings: p.appliedProcessings.map(ap =>
                                  ap.processingId === processing.id
                                    ? { 
                                        ...ap, 
                                        calculatedPrice: calculatedPrice,
                                        selectedOptions: selectedOptions
                                      }
                                    : ap
                                ),
                                totalPrice: p.basePrice * p.quantity + p.appliedProcessings
                                  .map(ap => ap.processingId === processing.id ? calculatedPrice : ap.calculatedPrice)
                                  .reduce((sum, price) => sum + price, 0)
                              };
                            } else {
                              // Add new processing
                              const newProcessing = {
                                processingId: processing.id,
                                calculatedPrice: calculatedPrice,
                                isInherited: false,
                                appliedDate: new Date().toISOString(),
                                selectedOptions: selectedOptions
                              };
                              
                              const newTotalPrice = p.basePrice * p.quantity + 
                                [...p.appliedProcessings, newProcessing]
                                  .reduce((sum, ap) => sum + ap.calculatedPrice, 0);
                              
                              return {
                                ...p,
                                appliedProcessings: [...p.appliedProcessings, newProcessing],
                                totalPrice: newTotalPrice
                              };
                            }
                          }
                          return p;
                        });

                        // Update quote if it exists
                        let updatedQuote = prev.quote;
                        if (updatedQuote) {
                          updatedQuote = {
                            ...updatedQuote,
                            items: updatedProducts
                          };
                          // Recalculate quote totals
                          updatedQuote = recalculateQuote(updatedQuote);
                        }

                        return {
                          ...prev,
                          quote: updatedQuote
                        };
                      });
                    }}
                  />
                </div>

                {/* Price Summary - Right Panel (20%) */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow h-96 flex flex-col">
                    {/* Header Section */}
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {getCurrentRoom()?.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {getCurrentRoomModel()?.name} • {(workflow.quote?.items || []).filter(p => p.roomId === workflow.currentRoomId).length} products
                      </p>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {/* Price Breakdown by Room */}
                    <div className="border-t border-gray-200 pt-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Price by Room</h4>
                      {workflow.rooms.length > 0 ? (
                        <div className="space-y-2 text-xs">
                      {workflow.rooms.map((room) => {
                        const roomProducts = (workflow.quote?.items || []).filter(p => p.roomId === room.id);
                        const roomTotal = roomProducts.reduce((sum, product) => sum + product.totalPrice, 0);
                            const isActive = room.id === workflow.currentRoomId;
                        
                        return (
                          <div 
                            key={room.id} 
                                className={`p-2 rounded border ${
                                  isActive 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {room.name}
                                    {isActive && <span className="ml-1 text-blue-600">●</span>}
                                  </span>
                                  <span className={`font-semibold ${isActive ? 'text-blue-600' : 'text-green-600'}`}>
                                  ${roomTotal.toFixed(2)}
                                  </span>
                              </div>
                                <div className="text-gray-500">
                                  {roomProducts.length} product{roomProducts.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        );
                      })}
                      
                          {/* Grand Total */}
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between text-sm font-semibold">
                              <span className="text-gray-900">Total:</span>
                          <span className="text-green-600">
                            ${(workflow.quote?.items || []).reduce((sum, product) => sum + product.totalPrice, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <p className="text-xs">No rooms added yet</p>
                  </div>
                      )}
                    </div>
                  </div>
              </div>
                </div>
          </div>
        )}

          </div>
        )}


        {/* Phase 5: Fees & Delivery Configuration */}
        {workflow.currentPhase === 'fees_config' && workflow.quote && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure Fees & Delivery</h2>
              <p className="text-gray-600">Set tiered delivery fees and environmental fees for your quote</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Delivery Fees Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Delivery Fees</h3>
                <p className="text-gray-600 mb-4">Configure tiered delivery fees based on order value</p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tier 1 (Up to $500)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={workflow.quote?.deliveryFees.tier1 || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setWorkflow(prev => ({
                            ...prev,
                            quote: prev.quote ? {
                              ...prev.quote,
                              deliveryFees: { ...prev.quote.deliveryFees, tier1: value }
                            } : null
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tier 2 ($500 - $1000)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={workflow.quote?.deliveryFees.tier2 || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setWorkflow(prev => ({
                            ...prev,
                            quote: prev.quote ? {
                              ...prev.quote,
                              deliveryFees: { ...prev.quote.deliveryFees, tier2: value }
                            } : null
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tier 3 ($1000+)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={workflow.quote?.deliveryFees.tier3 || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setWorkflow(prev => ({
                            ...prev,
                            quote: prev.quote ? {
                              ...prev.quote,
                              deliveryFees: { ...prev.quote.deliveryFees, tier3: value }
                            } : null
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Fees Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Environmental Fees</h3>
                <p className="text-gray-600 mb-4">Configure environmental and sustainability fees</p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Carbon Offset Fee (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={workflow.quote?.environmentalFees.carbonOffsetPercentage || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setWorkflow(prev => ({
                            ...prev,
                            quote: prev.quote ? {
                              ...prev.quote,
                              environmentalFees: { ...prev.quote.environmentalFees, carbonOffsetPercentage: value }
                            } : null
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sustainability Fee ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={workflow.quote?.environmentalFees.sustainabilityFee || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setWorkflow(prev => ({
                            ...prev,
                            quote: prev.quote ? {
                              ...prev.quote,
                              environmentalFees: { ...prev.quote.environmentalFees, sustainabilityFee: value }
                            } : null
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="eco-friendly"
                      checked={workflow.quote?.environmentalFees.ecoFriendlyPackaging || false}
                      onChange={(e) => {
                        setWorkflow(prev => ({
                          ...prev,
                          quote: prev.quote ? {
                            ...prev.quote,
                            environmentalFees: { ...prev.quote.environmentalFees, ecoFriendlyPackaging: e.target.checked }
                          } : null
                        }));
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="eco-friendly" className="ml-2 block text-sm text-gray-700">
                      Apply eco-friendly packaging fee (+$25)
                    </label>
                  </div>
                </div>
              </div>

              {/* Quote Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${workflow.quote?.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {workflow.quote?.customerDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Customer Discount ({workflow.quote.customerDiscount}%):</span>
                      <span>-${((workflow.quote.subtotal * workflow.quote.customerDiscount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {workflow.quote?.orderDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Order Discount:</span>
                      <span>-${workflow.quote.orderDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>${workflow.quote?.deliveryFees.calculated?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Environmental Fees:</span>
                    <span>${workflow.quote?.environmentalFees.calculated?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${workflow.quote?.finalTotal?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>

        </div>

        {/* Sticky Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Phase {(['customer_config', 'room_config', 'product_config', 'fees_config'] as WorkflowPhase[]).indexOf(workflow.currentPhase) + 1} of 4
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(((['customer_config', 'room_config', 'product_config', 'fees_config'] as WorkflowPhase[]).indexOf(workflow.currentPhase) + 1) / 4) * 100}%` }}
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
                
                {canProceedToNextPhase() && workflow.currentPhase !== 'fees_config' && (
                  <button
                    onClick={proceedToNextPhase}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                  >
                    Continue →
                  </button>
                )}

                {workflow.currentPhase === 'fees_config' && workflow.quote && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveQuote}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Save & Return
                    </button>
                    <button
                      onClick={() => {
                        // Generate HTML content and open in new window using blob URL
                        const htmlContent = generateEnhancedPrintHTML();
                        
                        // Create a blob with the HTML content
                        const blob = new Blob([htmlContent], { type: 'text/html' });
                        const blobUrl = URL.createObjectURL(blob);
                        
                        // Open the blob URL in a new window
                        const printWindow = window.open(blobUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                        
                        if (printWindow) {
                          printWindow.focus();
                          
                          // Clean up the blob URL after a delay
                          setTimeout(() => {
                            URL.revokeObjectURL(blobUrl);
                          }, 10000);
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
